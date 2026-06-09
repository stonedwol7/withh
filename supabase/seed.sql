-- WITHH Seed Data
-- Run AFTER schema and after creating auth users

-- Auth users need to be created first via Supaba se Auth dashboard or API
-- Then link them with these IDs

-- CUSTOMERS
INSERT INTO customers (id, name, phone, email, emergency_contact, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sarah Johnson', '+1 (555) 123-4567', 'sarah@example.com', '{"name":"Mike Johnson","phone":"+1 (555) 987-6543","relationship":"Spouse"}', '2026-05-01T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000002', 'Maria Garcia', '+1 (555) 234-5678', 'maria@example.com', '{"name":"Elena Garcia","phone":"+1 (555) 876-5432","relationship":"Daughter"}', '2026-05-03T14:00:00Z'),
  ('00000000-0000-0000-0000-000000000003', 'James Kim', '+1 (555) 345-6789', 'james@example.com', '{"name":"Sue Kim","phone":"+1 (555) 765-4321","relationship":"Sister"}', '2026-05-05T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000004', 'Emily Chen', '+1 (555) 456-7890', 'emily@example.com', '{"name":"David Chen","phone":"+1 (555) 654-3210","relationship":"Brother"}', '2026-05-07T11:00:00Z'),
  ('00000000-0000-0000-0000-000000000005', 'David Williams', '+1 (555) 567-8901', 'david@example.com', '{"name":"Lisa Williams","phone":"+1 (555) 432-1098","relationship":"Mother"}', '2026-05-10T16:00:00Z'),
  ('00000000-0000-0000-0000-000000000006', 'Priya Patel', '+1 (555) 678-9012', 'priya@example.com', '{"name":"Raj Patel","phone":"+1 (555) 321-0987","relationship":"Husband"}', '2026-05-12T08:00:00Z'),
  ('00000000-0000-0000-0000-000000000007', 'Robert Nguyen', '+1 (555) 789-0123', 'robert@example.com', '{"name":"Mai Nguyen","phone":"+1 (555) 210-9876","relationship":"Mother"}', '2026-05-15T13:00:00Z'),
  ('00000000-0000-0000-0000-000000000008', 'Fatima Hassan', '+1 (555) 890-1234', 'fatima@example.com', '{"name":"Ahmed Hassan","phone":"+1 (555) 109-8765","relationship":"Father"}', '2026-05-18T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000009', 'Carlos Mendez Jr', '+1 (555) 901-2345', 'carlosj@example.com', '{"name":"Ana Mendez","phone":"+1 (555) 098-7654","relationship":"Mother"}', '2026-05-20T15:00:00Z'),
  ('00000000-0000-0000-0000-000000000010', 'Aisha Williams', '+1 (555) 012-3456', 'aishaw@example.com', '{"name":"John Williams","phone":"+1 (555) 987-0123","relationship":"Uncle"}', '2026-05-22T11:00:00Z');

-- SUPPORT PARTNERS
INSERT INTO support_partners (id, name, phone, email, gender, age, verification_status, rating, availability_status, bio, specialties, languages, completed_journeys, created_at) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Aisha Mohammed', '+1 (555) 111-2222', 'aisha@withh.com', 'female', 34, 'verified', 4.9, 'available', 'Certified companion with 3+ years of experience. Specializes in medical appointments and hospital visits.', ARRAY['medical','hospital','elderly'], ARRAY['english','arabic','french'], 47, '2025-01-15T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000012', 'Carlos Mendez', '+1 (555) 222-3333', 'carlos@withh.com', 'male', 42, 'verified', 4.7, 'available', 'Patient and attentive companion for elderly care and community appointments.', ARRAY['elderly','community','government'], ARRAY['english','spanish'], 32, '2025-03-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000013', 'Priya Sharma', '+1 (555) 333-4444', 'priya@withh.com', 'female', 29, 'verified', 4.95, 'available', 'Warm and experienced companion specializing in hospital support and maternal care.', ARRAY['hospital','maternal','medical'], ARRAY['english','hindi','punjabi'], 58, '2025-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000014', 'Michael Thompson', '+1 (555) 444-5555', 'michael@withh.com', 'male', 38, 'verified', 4.5, 'available', 'Reliable companion for general errands and community support.', ARRAY['community','errands','general'], ARRAY['english'], 21, '2025-06-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000015', 'Yuki Tanaka', '+1 (555) 555-6666', 'yuki@withh.com', 'female', 31, 'verified', 4.85, 'available', 'Multilingual companion with a calm, reassuring presence for medical and travel support.', ARRAY['medical','travel','elderly','hospital'], ARRAY['english','japanese','mandarin'], 39, '2025-02-15T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000016', 'Oluwaseun Adeyemi', '+1 (555) 666-7777', 'seun@withh.com', 'female', 27, 'verified', 4.6, 'available', 'Compassionate companion dedicated to making every journey safe and comfortable.', ARRAY['medical','elderly','community'], ARRAY['english','yoruba'], 15, '2025-08-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000017', 'Dmitri Volkov', '+1 (555) 777-8888', 'dmitri@withh.com', 'male', 45, 'verified', 4.7, 'available', 'Steady and dependable companion for hospital visits and daily errands.', ARRAY['hospital','errands','government'], ARRAY['english','russian','ukrainian'], 25, '2025-04-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000018', 'Maya Singh', '+1 (555) 888-9999', 'maya@withh.com', 'female', 33, 'verified', 4.8, 'available', 'Empathetic support for legal appointments and college admissions. Great with nervous first-timers.', ARRAY['legal','college','appointments'], ARRAY['english','hindi'], 19, '2025-05-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000019', 'James O Brien', '+1 (555) 999-0000', 'jameso@withh.com', 'male', 36, 'pending', 4.3, 'available', 'Friendly companion for travel accompaniment and city navigation.', ARRAY['travel','community','general'], ARRAY['english'], 8, '2025-09-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000020', 'Lena Schmidt', '+1 (555) 000-1111', 'lena@withh.com', 'female', 28, 'verified', 4.75, 'available', 'Calm and organized companion specializing in medical interpretation and hospital support.', ARRAY['medical','hospital','travel'], ARRAY['english','german','french'], 12, '2025-07-01T00:00:00Z');

-- REQUESTS (various statuses for demo)
INSERT INTO requests (id, customer_id, category, title, description, meeting_location, destination, date, time, duration, preferred_gender, status, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Medical Appointment', 'Prenatal Checkup', 'Need accompaniment to a prenatal checkup appointment. First visit, feeling nervous.', '123 Oak St, Apt 4B', 'City General Hospital, 100 Healthcare Blvd', '2026-06-10', '09:00', '2-4 hours', 'female', 'requested', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000002', 'Government Office', 'Visa Renewal', 'Need help with visa renewal paperwork and appointment at immigration office.', '456 Maple Ave', 'Federal Immigration Office, 200 Main St', '2026-06-12', '14:00', '2-4 hours', 'no-preference', 'requested', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000003', 'Travel Companion', 'Airport Drop-off', 'Early morning airport drop-off and gate assistance. Need help with luggage.', '789 Pine Rd', 'International Airport, Terminal 3', '2026-06-15', '06:30', 'under-2 hours', 'male', 'assigned', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000004', 'Medical Appointment', 'Surgery Follow-up', 'Follow-up appointment after surgery. Need translation support (Cantonese).', '12 Cherry Blossom Ln', 'St. Mary Hospital, 500 Health Park Dr', '2026-06-08', '10:00', '2-4 hours', 'female', 'in-progress', NOW() - INTERVAL '7 days', NOW() - INTERVAL '12 hours'),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000005', 'Medical Appointment', 'Annual Physical', 'Regular checkup with primary care physician.', '55 Lakeview Dr', 'Downtown Medical Center, 300 Physician Blvd', '2026-06-05', '11:00', 'under-2 hours', 'no-preference', 'completed', NOW() - INTERVAL '14 days', NOW() - INTERVAL '12 days'),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000001', 'General Accompaniment', 'Grocery & Pharmacy Run', 'Need help with grocery shopping and pharmacy pick-up. Limited walking ability.', '123 Oak St, Apt 4B', 'Various locations - Downtown Area', '2026-06-18', '13:00', '2-4 hours', 'female', 'in-progress', NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'),
  ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000002', 'Senior Citizen Support', 'Senior Center Visit', 'Visit to senior center for weekly social event. Wheelchair accessible transport needed.', '456 Maple Ave', 'Sunrise Senior Center, 800 Golden Years Dr', '2026-06-20', '10:00', '2-4 hours', 'no-preference', 'requested', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
  ('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000003', 'Medical Appointment', 'Eye Exam', 'Eye exam appointment - might need dilation so cannot drive afterward.', '789 Pine Rd', 'EyeCare Specialists, 450 Vision Way', '2026-06-22', '15:00', 'under-2 hours', 'no-preference', 'assigned', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000006', 'Appointment', 'Job Interview Support', 'First interview in years. Need emotional support and help navigating to the interview.', '350 Market St, Apt 12', 'TechCorp HQ, 100 Innovation Drive', '2026-06-25', '10:30', '2-4 hours', 'female', 'requested', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000007', 'Legal Appointment', 'Lawyer Meeting', 'Meeting with lawyer about family legal matter. Need moral support.', '88 River Rd', 'Legal Aid Center, 200 Justice Ave', '2026-06-28', '09:00', 'under-2 hours', 'no-preference', 'requested', NOW(), NOW());

-- ASSIGNMENTS
INSERT INTO assignments (id, request_id, partner_id, assigned_by, assigned_at, accepted_at, completed_at, status) VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000012', NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NULL, 'accepted'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000013', NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NULL, 'accepted'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000011', NULL, NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', 'completed'),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000015', NULL, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '6 hours', NULL, 'accepted'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000017', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NULL, 'accepted');

-- JOURNEY EVENTS
INSERT INTO journey_events (id, request_id, event_type, notes, created_at) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000101', 'request_created', 'Customer submitted a new request for prenatal checkup', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000101', 'under_review', 'Request moved to under review', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000104', 'request_created', 'Customer submitted request for surgery follow-up', NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000104', 'partner_assigned', 'Priya Sharma assigned to this request', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000104', 'partner_accepted', 'Priya Sharma accepted the assignment', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000104', 'journey_started', 'Journey started - partner en route', NOW() - INTERVAL '12 hours'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000105', 'request_created', 'Customer submitted request for annual physical', NOW() - INTERVAL '14 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000105', 'partner_assigned', 'Aisha Mohammed assigned', NOW() - INTERVAL '13 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000105', 'journey_completed', 'Journey completed successfully', NOW() - INTERVAL '12 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000106', 'request_created', 'Customer submitted request for grocery run', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000106', 'partner_assigned', 'Yuki Tanaka assigned', NOW() - INTERVAL '12 hours'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000106', 'journey_started', 'Journey started - partner en route', NOW() - INTERVAL '4 hours'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000103', 'request_created', 'Customer submitted request for airport assistance', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000103', 'partner_assigned', 'Carlos Mendez assigned', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000103', 'partner_accepted', 'Carlos Mendez accepted', NOW() - INTERVAL '2 days');

-- JOURNEY MESSAGES
INSERT INTO journey_messages (id, request_id, sender_type, sender_name, content, created_at) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000104', 'partner', 'Priya Sharma', 'Hello! I am Priya, your companion for tomorrow hospital visit. I will be at your place at 9:30 AM.', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000104', 'customer', 'Emily Chen', 'Thank you Priya! I will be ready. I really appreciate the help.', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000104', 'partner', 'Priya Sharma', 'Of course! I have reviewed your appointment details. The check-in is at 10 AM, so we have plenty of time.', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000105', 'partner', 'Aisha Mohammed', 'Good morning! I am on my way to pick you up. See you soon!', NOW() - INTERVAL '13 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000105', 'customer', 'David Williams', 'Great, see you soon!', NOW() - INTERVAL '13 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000103', 'partner', 'Carlos Mendez', 'Hi James! Just confirming our airport trip this Friday. I will pick you up at 6 AM sharp!', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000103', 'customer', 'James Kim', 'Perfect, thanks Carlos!', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000106', 'partner', 'Yuki Tanaka', 'Hello Sarah! I am heading over now for our grocery trip. See you in 20 minutes!', NOW() - INTERVAL '4 hours');

-- OPERATIONS TEAM
INSERT INTO operations_team (id, name, email, role) VALUES
  (gen_random_uuid(), 'Alex Rivera', 'alex@withh.com', 'lead'),
  (gen_random_uuid(), 'Jordan Taylor', 'jordan@withh.com', 'operator');
