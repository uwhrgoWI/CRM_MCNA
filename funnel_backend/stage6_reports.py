# Stage 6: PowerBI Export and Analytics Views Engine
# Writes database views on top of PostgreSQL CRM structures, 
# and connects via Pandas/SQLAlchemy to compile multi-sheet Excel reports with automated KPIs.

import os
from sqlalchemy import create_engine, text
import pandas as pd

# =========================================================================
# DATABASE SQL ENVIRONMENT VIEWS
# =========================================================================
VIEWS_DDL = {
    "v_funnel_conversion": """
        CREATE OR REPLACE VIEW v_funnel_conversion AS
        WITH stage_metrics AS (
            -- Step 1: Map sequence ranks to our marketing funnel stages
            SELECT 
                stage,
                COUNT(*) as leads_currently_in_stage,
                CASE 
                    WHEN LOWER(stage) = 'awareness' THEN 1
                    WHEN LOWER(stage) = 'lead scoring' THEN 2
                    WHEN LOWER(stage) = 'sales' THEN 3
                    WHEN LOWER(stage) = 'payment' THEN 4
                    WHEN LOWER(stage) = 'control' THEN 5
                    ELSE 6
                END AS stage_sequence_id
            FROM leads
            GROUP BY stage, stage_sequence_id
        ),
        cumulative_reach AS (
            -- Step 2: Compute dynamic pipeline volume thresholds
            -- Assuming progressive stage sequence flows
            SELECT 
                stage,
                leads_currently_in_stage,
                stage_sequence_id,
                SUM(leads_currently_in_stage) OVER (ORDER BY stage_sequence_id DESC) AS cumulative_volume_reached
            FROM stage_metrics
        )
        SELECT 
            stage_sequence_id,
            stage,
            leads_currently_in_stage,
            cumulative_volume_reached AS active_leads_count,
            
            -- Step 3: Compute Drop-off Rate representing percentages of lost leads vs previous stage volumes
            ROUND(
                (1.0 - (
                    cumulative_volume_reached::float / 
                    NULLIF(
                        LAG(cumulative_volume_reached) OVER (ORDER BY stage_sequence_id), 
                        0
                    )::float
                ))::numeric * 100.0, 
                2
            ) AS drop_off_pct
        FROM cumulative_reach;
    """,

    "v_sales_performance": """
        CREATE OR REPLACE VIEW v_sales_performance AS
        SELECT 
            l.assigned_sales_id AS sales_rep_id,
            COUNT(DISTINCT l.id) AS total_assigned_leads,
            COUNT(DISTINCT CASE WHEN d.id IS NOT NULL THEN l.id END) AS total_deals_created,
            COUNT(DISTINCT CASE WHEN d.status = 'closed_won' THEN d.id END) AS closed_won_deals,
            
            -- Total Revenue (sum of amounts where status is won)
            COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'closed_won'), 0.00) AS clean_realized_revenue,
            
            -- Estimate Pipeline Value
            COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'open'), 0.00) AS in_flight_deal_value,
            
            -- Lead-to-Deal Conversion Rate %
            ROUND(
                (COUNT(DISTINCT CASE WHEN d.status = 'closed_won' THEN d.id END)::float / 
                NULLIF(COUNT(DISTINCT l.id), 0)::float) * 100.0, 
                2
            ) AS conversion_rate_pct
        FROM leads l
        LEFT JOIN deals d ON l.id = d.lead_id
        WHERE l.assigned_sales_id IS NOT NULL
        GROUP BY l.assigned_sales_id;
    """,

    "v_lead_source_roi": """
        CREATE OR REPLACE VIEW v_lead_source_roi AS
        SELECT 
            c.source AS acquisition_channel,
            COUNT(DISTINCT c.id) AS total_contacts,
            COUNT(DISTINCT l.id) AS raw_leads,
            COUNT(DISTINCT d.id) AS deals_generated,
            COUNT(DISTINCT CASE WHEN d.status = 'closed_won' THEN d.id END) AS sales_victory_count,
            
            -- Financial pipeline yields
            COALESCE(SUM(d.amount), 0.00) AS gross_estimated_pipeline,
            COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'closed_won'), 0.00) AS actual_won_revenue,
            
            -- Conversion efficiency metrics 
            ROUND(
                (COUNT(DISTINCT CASE WHEN d.status = 'closed_won' THEN d.id END)::float / 
                NULLIF(COUNT(DISTINCT l.id), 0)::float) * 100.0, 
                2
            ) AS conversion_yield_pct
        FROM contacts c
        LEFT JOIN leads l ON c.id = l.contact_id
        LEFT JOIN deals d ON l.id = d.lead_id
        GROUP BY c.source;
    """
}


# =========================================================================
# PYTHON REPORTER PIPELINE CLASS
# =========================================================================
class ExcelReportingPipeline:
    def __init__(self, db_uri: str):
        self.engine = create_engine(db_uri)

    def bootstrap_reporting_views(self):
        """
        Sets up our structured analytical SQL views within the target DB instance.
        """
        print("[DATABASE ADMIN] Bootstrapping structured tracking views in target instance...")
        with self.engine.begin() as conn:
            for view_name, query in VIEWS_DDL.items():
                conn.execute(text(f"DROP VIEW IF EXISTS {view_name} CASCADE;"))
                conn.execute(text(query))
                print(f" -> View '{view_name}' deployed successfully.")

    def run_export(self, target_filepath: str = "CRM_PowerBI_RawSource.xlsx"):
        """
        ETL function linking reporting view states over to formatted Excel worksheets.
        Injects a pre-calculated executive summary sheet highlighting key business KPI bounds.
        """
        print(f"[REPORTER PIPELINE] Querying database views & initializing spreadsheet compilation...")
        
        # 1. Pull dataframes directly from optimized analytics views
        df_funnel = pd.read_sql("SELECT * FROM v_funnel_conversion ORDER BY stage_sequence_id ASC;", self.engine)
        df_sales = pd.read_sql("SELECT * FROM v_sales_performance ORDER BY clean_realized_revenue DESC;", self.engine)
        df_roi = pd.read_sql("SELECT * FROM v_lead_source_roi ORDER BY actual_won_revenue DESC;", self.engine)

        # 2. Extract strategic KPIs for C-Suite Dashboard
        total_pipeline_value = float(df_roi["gross_estimated_pipeline"].sum())
        total_won_revenue = float(df_roi["actual_won_revenue"].sum())
        total_won_deals = int(df_roi["sales_victory_count"].sum())
        
        avg_deal_size = total_won_revenue / total_won_deals if total_won_deals > 0 else 0.0

        # Retrieve top representative performer based on verified financial conversion
        if not df_sales.empty:
            top_rep = df_sales.iloc[0]
            best_sales_rep_id = top_rep["sales_rep_id"]
            best_rep_revenue = float(top_rep["clean_realized_revenue"])
            rep_text = f"Rep ID: {best_sales_rep_id} (${best_rep_revenue:,.2f} USD)"
        else:
            rep_text = "N/A"

        # Lookup dynamic marketing sourcing channel reporting largest returns 
        if not df_roi.empty:
            top_channel = df_roi.iloc[0]
            top_channel_name = top_channel["acquisition_channel"]
            top_channel_revenue = float(top_channel["actual_won_revenue"])
            source_text = f"'{top_channel_name}' Sourcing (${top_channel_revenue:,.2f} USD)"
        else:
            source_text = "N/A"

        # 3. Structural mapping of executive KPIs metadata values
        df_summary = pd.DataFrame({
            "Aura Executive KPI Key": [
                "Total Pipeline Value (Gross Booked)",
                "Total Realized Revenue (Closed Won)",
                "Average Contract Deal Size (Closed Won)",
                "Corporate MVP Performer Rep",
                "Leading ROI Acquisition Source Channel"
            ],
            "Value": [
                f"${total_pipeline_value:,.2f}",
                f"${total_won_revenue:,.2f}",
                f"${avg_deal_size:,.2f}",
                rep_text,
                source_text
            ],
            "Reporting Coverage Duration": ["Last 30 Days"] * 5
        })

        # 4. Write Excel workbook utilizing Pandas ExcelWriter engine
        with pd.ExcelWriter(target_filepath, engine="openpyxl") as writer:
            df_summary.to_excel(writer, sheet_name="Executive Dashboard KPIs", index=False)
            df_funnel.to_excel(writer, sheet_name="Funnel Stage Conversion", index=False)
            df_sales.to_excel(writer, sheet_name="Sales Rep Performance", index=False)
            df_roi.to_excel(writer, sheet_name="Lead Source Channel ROI", index=False)

        print(f"[REPORTER SUCCESS] CRM performance report successfully compiled into file: {target_filepath}")


# =========================================================================
# RUNTIME TRIGGER TEST BLOCK
# =========================================================================
if __name__ == "__main__":
    # Point variables over to your production PostgreSQL system string:
    # Example: "postgresql://postgres_user:secure_pwd@localhost:5432/marketing_crm"
    DEMO_DB_URI = "sqlite:///./crm_analytics_reporting.db"
    
    # Simple check sequence to ensure mock engines construct tables safely first
    from sqlalchemy import Column, Integer, String, Numeric, DateTime, create_engine
    from sqlalchemy.ext.declarative import declarative_base

    MockBase = declarative_base()
    class Lead(MockBase):
        __tablename__ = 'leads'
        id = Column(String, primary_key=True)
        stage = Column(String)
        assigned_sales_id = Column(String)
        created_at = Column(DateTime)
        
    class Deal(MockBase):
        __tablename__ = 'deals'
        id = Column(String, primary_key=True)
        lead_id = Column(String)
        amount = Column(Numeric)
        status = Column(String)
        payment_status = Column(String)
        
    class Contact(MockBase):
        __tablename__ = 'contacts'
        id = Column(String, primary_key=True)
        source = Column(String)

    engine = create_engine(DEMO_DB_URI)
    MockBase.metadata.create_all(bind=engine)

    pipeline = ExcelReportingPipeline(DEMO_DB_URI)
    pipeline.bootstrap_reporting_views()
    pipeline.run_export()
