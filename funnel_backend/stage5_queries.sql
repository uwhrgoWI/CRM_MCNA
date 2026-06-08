-- Stage 5 - Component 3: Advanced Pipeline Quality & Anomaly Analytics
-- Designed for manager dashboards to analyze productivity rates and catch structural anomalies.
-- Tracks last 30 days of data, partitioned into weekly segments.

WITH sales_weekly_aggregation AS (
    SELECT 
        -- Grouping metrics sequentially by calendar week and Sales Representative
        DATE_TRUNC('week', l.created_at) AS calendar_week,
        l.assigned_sales_id AS rep_id,
        
        -- Metric 1: Total volume of Leads assigned to this rep
        COUNT(DISTINCT l.id) AS total_leads,
        
        -- Count of successfully closed won deals
        COUNT(DISTINCT CASE WHEN d.status = 'closed_won' THEN d.id END) AS closed_won_deals,
        
        -- Metric 2: Average currency value of successfully processed contracts (Avg Deal Size)
        COALESCE(
            ROUND(
                AVG(d.amount) FILTER (WHERE d.status = 'closed_won')::numeric, 
                2
            ), 
            0.00
        ) AS avg_deal_size,
        
        -- Count of total created deals (both won, lost, and open)
        COUNT(DISTINCT d.id) AS total_deals
    FROM leads l
    LEFT JOIN deals d ON l.id = d.lead_id
    WHERE l.created_at >= NOW() - INTERVAL '30 days'
      AND l.assigned_sales_id IS NOT NULL
    GROUP BY 
        DATE_TRUNC('week', l.created_at), 
        l.assigned_sales_id
),
computed_metrics AS (
    SELECT 
        calendar_week,
        rep_id,
        total_leads,
        closed_won_deals,
        avg_deal_size,
        
        -- Metric 3: Conversion Rate calculated safely to avoid dividing by 0
        COALESCE(
            ROUND(
                (closed_won_deals::float / NULLIF(total_leads, 0)::float) * 100.0, 
                2
            ), 
            0.00
        ) AS conversion_rate
    FROM sales_weekly_aggregation
)
SELECT 
    calendar_week,
    rep_id,
    total_leads,
    closed_won_deals,
    conversion_rate,
    avg_deal_size,
    
    -- SYSTEM QUALITY CONTROL LAYER FLAGS:
    -- Flag agents reporting abnormally high (> 80% fake close suspicion) 
    -- or low (< 5% onboarding assistance indication) performance ratios.
    CASE 
        WHEN conversion_rate > 80.00 AND total_leads >= 5 THEN 'CRITICAL_SUSPICIOUSLY_HIGH_CONVERSION'
        WHEN conversion_rate < 5.00 AND total_leads >= 5 THEN 'WARNING_SUSPICIOUSLY_LOW_CONVERSION'
        ELSE 'AUTHORIZED_DATA_HEALTHY'
    END AS Quality_Status_Indicator,
    
    -- Support analysis detailing flagged triggers
    CASE 
        WHEN conversion_rate > 80.00 AND total_leads >= 5 
            THEN 'Alert: Rep reports conversion rate exceeding 80% out of valid volume. Audit logs audit suggested.'
        WHEN conversion_rate < 5.00 AND total_leads >= 5 
            THEN 'Notice: Rep reports conversion rate below 5% out of valid volume. Co-working coaching recommended.'
        ELSE 'Operational quality conforms with standard CRM funnel performance indexes.'
    END AS anomaly_description
FROM computed_metrics
ORDER BY 
    calendar_week DESC, 
    conversion_rate DESC;
