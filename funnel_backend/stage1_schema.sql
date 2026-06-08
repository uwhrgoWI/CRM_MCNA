-- Stage 1: Database Schema (PostgreSQL DDL)
-- Designed for Marketing Funnel pipeline tracking
-- Stages: AWARENESS → LEAD SCORING → SALES → PAYMENT → CONTROL

-- Enable UUID extension if we want UUID IDs (highly recommended for CRM)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enum Types
CREATE TYPE lead_status_enum AS ENUM ('hot', 'warm', 'cold');
CREATE TYPE activity_type_enum AS ENUM ('call', 'meeting', 'email', 'proposal');
CREATE TYPE deal_status_enum AS ENUM ('open', 'closed_won', 'closed_lost', 'nurture');

-- =========================================================================
-- TABLE: contacts
-- =========================================================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL, -- 'form', 'ads', 'referral', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    assigned_to UUID, -- Refers to SalesRep (assigned_sales_id)
    
    -- Check constraints to prevent empty strings or leading/trailing whitespace bypass
    CONSTRAINT chk_contacts_name_not_empty CHECK (LENGTH(TRIM(full_name)) >= 1),
    CONSTRAINT chk_contacts_phone_not_empty CHECK (LENGTH(TRIM(phone)) >= 1)
);

-- =========================================================================
-- TABLE: leads
-- =========================================================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 0,
    status lead_status_enum NOT NULL DEFAULT 'cold',
    assigned_sales_id UUID, -- Links to your sales reps
    stage VARCHAR(100) NOT NULL DEFAULT 'Awareness', -- 'Awareness', 'Lead Scoring', 'Sales', 'Payment', 'Control'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_leads_score_range CHECK (score >= 0 AND score <= 100)
);

-- =========================================================================
-- TABLE: activities
-- =========================================================================
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    type activity_type_enum NOT NULL,
    content TEXT NOT NULL,
    outcome VARCHAR(255),
    created_by UUID, -- Agent ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- TABLE: deals
-- =========================================================================
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status deal_status_enum NOT NULL DEFAULT 'open',
    contract_url VARCHAR(2048),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'partially_paid', 'paid', 'payment_failed'
    closed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_deals_amount_positive CHECK (amount >= 0)
);

-- =========================================================================
-- TABLE: audit_log
-- =========================================================================
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    field_changed VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(255) DEFAULT 'system' NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- =========================================================================
-- Crucial for pipeline filters, routing assignment speed, and analytics aggregation
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_sales_id ON leads(assigned_sales_id);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_deals_lead_id ON deals(lead_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_audit_log_lookup ON audit_log(table_name, record_id);

-- =========================================================================
-- AUTOMATED AUDITING TRIGGERS (PL/pgSQL)
-- =========================================================================

-- Trigger to update updated_at timestamps on row modifications
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_leads
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_deals
BEFORE UPDATE ON deals
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();


-- Master Dynamic Auditing Trigger Handler to record changes dynamically
CREATE OR REPLACE FUNCTION audit_log_trigger_handler()
RETURNS TRIGGER AS $$
DECLARE
    schema_record RECORD;
    col_name TEXT;
    o_val TEXT;
    n_val TEXT;
    changed_by_val VARCHAR := 'system';
BEGIN
    -- Resolve potential session user to log authorized changes
    BEGIN
        changed_by_val := current_setting('request.jwt.claims', true)::json->>'email';
    EXCEPTION WHEN OTHERS THEN
        changed_by_val := CURRENT_USER::VARCHAR;
    END;
    
    IF changed_by_val IS NULL OR changed_by_val = '' THEN
        changed_by_val := 'system';
    END IF;

    -- Dynamically loop through table columns to detect modified cells
    FOR schema_record IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = TG_TABLE_NAME AND table_schema = TG_TABLE_SCHEMA
    LOOP
        col_name := schema_record.column_name;
        
        -- Ignore timestamp update fields to reduce unnecessary noise in auditing
        IF col_name = 'updated_at' THEN
            CONTINUE;
        END IF;

        EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', col_name, col_name)
        USING OLD, NEW
        INTO o_val, n_val;
        
        IF (o_val IS DISTINCT FROM n_val) THEN
            INSERT INTO audit_log (table_name, record_id, field_changed, old_value, new_value, changed_by)
            VALUES (TG_TABLE_NAME, OLD.id::text, col_name, o_val, n_val, changed_by_val);
        END IF;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hook triggers on tables requiring active operational logging
CREATE TRIGGER audit_contacts_update
AFTER UPDATE ON contacts
FOR EACH ROW EXECUTE PROCEDURE audit_log_trigger_handler();

CREATE TRIGGER audit_leads_update
AFTER UPDATE ON leads
FOR EACH ROW EXECUTE PROCEDURE audit_log_trigger_handler();

CREATE TRIGGER audit_deals_update
AFTER UPDATE ON deals
FOR EACH ROW EXECUTE PROCEDURE audit_log_trigger_handler();
