-- WITHH Database Schema
-- Run in Supabase SQL Editor or via: psql "$SUPABASE_DB_URL" -f supabase/schema.sql

-- 1. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  emergency_contact JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SUPPORT PARTNERS
CREATE TABLE IF NOT EXISTS support_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  gender TEXT,
  age INTEGER,
  verification_status TEXT DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0,
  availability_status TEXT DEFAULT 'available',
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  completed_journeys INTEGER DEFAULT 0,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. REQUESTS
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT,
  description TEXT,
  meeting_location TEXT,
  destination TEXT,
  date DATE,
  time TIME,
  duration TEXT,
  preferred_gender TEXT,
  special_notes TEXT,
  status TEXT DEFAULT 'requested',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES support_partners(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'assigned'
);

-- 5. JOURNEY EVENTS
CREATE TABLE IF NOT EXISTS journey_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. JOURNEY MESSAGES
CREATE TABLE IF NOT EXISTS journey_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. OPERATIONS TEAM
CREATE TABLE IF NOT EXISTS operations_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'operator',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_requests_customer_id ON requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_assignments_request_id ON assignments(request_id);
CREATE INDEX IF NOT EXISTS idx_assignments_partner_id ON assignments(partner_id);
CREATE INDEX IF NOT EXISTS idx_journey_events_request_id ON journey_events(request_id);
CREATE INDEX IF NOT EXISTS idx_journey_messages_request_id ON journey_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "customers_own" ON customers FOR ALL USING (auth_id = auth.uid());
CREATE POLICY "partners_own" ON support_partners FOR ALL USING (auth_id = auth.uid());

CREATE POLICY "requests_select" ON requests FOR SELECT USING (
  customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
  OR id IN (SELECT request_id FROM assignments WHERE partner_id IN (SELECT id FROM support_partners WHERE auth_id = auth.uid()))
  OR auth.uid() IN (SELECT auth_id FROM operations_team)
);

CREATE POLICY "requests_insert" ON requests FOR INSERT WITH CHECK (
  customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
);

CREATE POLICY "assignments_select" ON assignments FOR SELECT USING (
  request_id IN (SELECT id FROM requests WHERE customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()))
  OR partner_id IN (SELECT id FROM support_partners WHERE auth_id = auth.uid())
  OR auth.uid() IN (SELECT auth_id FROM operations_team)
);

CREATE POLICY "journey_events_select" ON journey_events FOR SELECT USING (
  request_id IN (SELECT id FROM requests WHERE customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()))
  OR request_id IN (SELECT request_id FROM assignments WHERE partner_id IN (SELECT id FROM support_partners WHERE auth_id = auth.uid()))
  OR auth.uid() IN (SELECT auth_id FROM operations_team)
);

CREATE POLICY "journey_messages_select" ON journey_messages FOR SELECT USING (
  request_id IN (SELECT id FROM requests WHERE customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()))
  OR request_id IN (SELECT request_id FROM assignments WHERE partner_id IN (SELECT id FROM support_partners WHERE auth_id = auth.uid()))
  OR auth.uid() IN (SELECT auth_id FROM operations_team)
);

CREATE POLICY "journey_messages_insert" ON journey_messages FOR INSERT WITH CHECK (
  request_id IN (SELECT id FROM requests WHERE customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()))
  OR request_id IN (SELECT request_id FROM assignments WHERE partner_id IN (SELECT id FROM support_partners WHERE auth_id = auth.uid()))
);
