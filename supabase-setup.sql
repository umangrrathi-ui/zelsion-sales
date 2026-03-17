-- =============================================
-- ZELSION SALES MANAGER — SUPABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- Table 1: clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  company_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  city TEXT,
  state TEXT DEFAULT 'Gujarat',
  gst_number TEXT,
  product_interest TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- Table 2: sales_orders
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE,
  current_stage TEXT DEFAULT 'inquiry',

  -- Stage 1: Inquiry
  inquiry_date DATE,
  inquiry_source TEXT,
  product_name TEXT,
  quantity_kg NUMERIC,
  inquiry_notes TEXT,

  -- Stage 2: Quotation
  quotation_date DATE,
  quotation_number TEXT,
  quoted_price_per_kg NUMERIC,
  quotation_validity_days INTEGER DEFAULT 30,
  quotation_notes TEXT,

  -- Stage 3: Follow-up
  last_followup_date DATE,
  next_followup_date DATE,
  followup_status TEXT,

  -- Stage 4: PO Received
  po_date DATE,
  po_number TEXT,
  po_amount NUMERIC,
  po_quantity_kg NUMERIC,

  -- Stage 5: Payment Terms
  payment_terms TEXT,
  advance_percentage INTEGER,
  credit_days INTEGER,
  payment_mode TEXT,

  -- Stage 6: Advance Payment
  advance_amount NUMERIC,
  advance_received_date DATE,
  advance_utr TEXT,
  advance_notes TEXT,

  -- Stage 7: Production & Dispatch
  batch_number TEXT,
  expected_dispatch_date DATE,
  actual_dispatch_date DATE,
  transport_company TEXT,
  lr_number TEXT,

  -- Stage 8: Invoice / Bill
  invoice_number TEXT,
  invoice_date DATE,
  invoice_amount NUMERIC,
  taxable_amount NUMERIC,
  gst_amount NUMERIC,

  -- Stage 9: Delivery
  delivery_date DATE,
  delivery_confirmed BOOLEAN DEFAULT FALSE,
  delivery_notes TEXT,

  -- Stage 10: Balance Payment
  balance_amount NUMERIC,
  balance_received_date DATE,
  balance_utr TEXT,
  payment_completed BOOLEAN DEFAULT FALSE,

  created_by UUID REFERENCES auth.users(id)
);

-- Table 3: followups
CREATE TABLE IF NOT EXISTS followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
  followup_date DATE NOT NULL,
  mode TEXT,
  talked_to TEXT,
  notes TEXT NOT NULL,
  next_action TEXT,
  next_followup_date DATE,
  created_by UUID REFERENCES auth.users(id)
);

-- Table 4: documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can do everything
CREATE POLICY "Authenticated users full access" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access" ON sales_orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access" ON followups
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access" ON documents
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- STORAGE BUCKET
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'zelsion-docs',
  'zelsion-docs',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload/read/delete
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'zelsion-docs' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read" ON storage.objects
  FOR SELECT USING (bucket_id = 'zelsion-docs' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'zelsion-docs' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'zelsion-docs' AND auth.role() = 'authenticated');
