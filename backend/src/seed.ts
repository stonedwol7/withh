import { getDb, initializeDatabase } from './db';

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

initializeDatabase();
const db = getDb();

// Clear existing data
const tables = [
  'finance_records', 'partner_earnings', 'issues', 'operation_events',
  'payments', 'journey_messages', 'matches', 'ai_analyses',
  'support_requests', 'support_partners', 'trusted_contacts', 'customers', 'sessions'
];
for (const t of tables) {
  db.exec(`DELETE FROM ${t}`);
}

// Customers
const customers = [
  { id: 'customer-1', name: 'Sarah Johnson', phone: '+1 (555) 123-4567', email: 'sarah@example.com', gender_preference: 'female', language_preference: 'english', created_at: '2026-05-01T10:00:00Z' },
  { id: 'customer-2', name: 'Maria Garcia', phone: '+1 (555) 234-5678', email: 'maria@example.com', gender_preference: 'no-preference', language_preference: 'spanish', created_at: '2026-05-03T14:00:00Z' },
  { id: 'customer-3', name: 'James Kim', phone: '+1 (555) 345-6789', email: 'james@example.com', gender_preference: 'male', language_preference: 'english', created_at: '2026-05-05T09:00:00Z' },
  { id: 'customer-4', name: 'Emily Chen', phone: '+1 (555) 456-7890', email: 'emily@example.com', gender_preference: 'female', language_preference: 'cantonese', created_at: '2026-05-07T11:00:00Z' },
  { id: 'customer-5', name: 'David Williams', phone: '+1 (555) 567-8901', email: 'david@example.com', gender_preference: 'no-preference', language_preference: 'english', created_at: '2026-05-10T16:00:00Z' },
];

const insertCustomer = db.prepare(`INSERT INTO customers (id, name, phone, email, gender_preference, language_preference, repeat_partner_ids, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
for (const c of customers) {
  insertCustomer.run(c.id, c.name, c.phone, c.email, c.gender_preference, c.language_preference, '[]', c.created_at);
}

// Support Partners
const partners = [
  { id: 'partner-1', name: 'Aisha Mohammed', phone: '+1 (555) 111-2222', email: 'aisha@withh.com', gender: 'female', languages: '["english","arabic","french"]', completed_journeys: 47, verified: 1, bio: 'Certified companion with 3 years of experience supporting women through medical appointments.', specialties: '["medical","elderly","hospital"]', rating: 4.9, joined_at: '2025-01-15T00:00:00Z' },
  { id: 'partner-2', name: 'Carlos Mendez', phone: '+1 (555) 222-3333', email: 'carlos@withh.com', gender: 'male', languages: '["english","spanish"]', completed_journeys: 32, verified: 1, bio: 'Patient and attentive companion for elderly care and community appointments.', specialties: '["elderly","community","walking"]', rating: 4.7, joined_at: '2025-03-01T00:00:00Z' },
  { id: 'partner-3', name: 'Priya Sharma', phone: '+1 (555) 333-4444', email: 'priya@withh.com', gender: 'female', languages: '["english","hindi","punjabi"]', completed_journeys: 58, verified: 1, bio: 'Warm and experienced companion specializing in hospital support and maternal care.', specialties: '["hospital","maternal","elderly"]', rating: 4.95, joined_at: '2025-01-01T00:00:00Z' },
  { id: 'partner-4', name: 'Michael Thompson', phone: '+1 (555) 444-5555', email: 'michael@withh.com', gender: 'male', languages: '["english"]', completed_journeys: 21, verified: 0, bio: 'Reliable companion for general errands and community support.', specialties: '["community","errands","walking"]', rating: 4.5, joined_at: '2025-06-01T00:00:00Z' },
  { id: 'partner-5', name: 'Yuki Tanaka', phone: '+1 (555) 555-6666', email: 'yuki@withh.com', gender: 'female', languages: '["english","japanese","mandarin"]', completed_journeys: 39, verified: 1, bio: 'Multilingual companion with a calm, reassuring presence for medical and travel support.', specialties: '["medical","travel","elderly","hospital"]', rating: 4.85, joined_at: '2025-02-15T00:00:00Z' },
  { id: 'partner-6', name: 'Oluwaseun Adeyemi', phone: '+1 (555) 666-7777', email: 'seun@withh.com', gender: 'female', languages: '["english","yoruba"]', completed_journeys: 15, verified: 1, bio: 'Compassionate companion dedicated to making every journey safe and comfortable.', specialties: '["medical","elderly","community"]', rating: 4.6, joined_at: '2025-08-01T00:00:00Z' },
  { id: 'partner-7', name: 'Dmitri Volkov', phone: '+1 (555) 777-8888', email: 'dmitri@withh.com', gender: 'male', languages: '["english","russian","ukrainian"]', completed_journeys: 25, verified: 1, bio: 'Steady and dependable companion for hospital visits and daily errands.', specialties: '["hospital","errands","walking"]', rating: 4.7, joined_at: '2025-04-01T00:00:00Z' },
];

const insertPartner = db.prepare(`INSERT INTO support_partners (id, name, phone, email, gender, languages, completed_journeys, verified, bio, specialties, available, rating, joined_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
for (const p of partners) {
  insertPartner.run(p.id, p.name, p.phone, p.email, p.gender, p.languages, p.completed_journeys, p.verified, p.bio, p.specialties, 1, p.rating, p.joined_at);
}

// Support Requests (with various statuses)
const now = new Date();
const requests = [
  { id: 'req-1', customer_id: 'customer-1', who_needs_support: 'me', category: 'medical', meeting_location: '123 Oak St, Apt 4B', destination: 'City General Hospital, 100 Healthcare Blvd', date: '2026-06-10', time: '09:00', duration: '2-4', description: 'Need accompaniment to a prenatal checkup appointment.', accessibility_needs: '', gender_preference: 'female', language_preference: 'english', status: 'submitted', assigned_partner_id: null, created_at: new Date(now.getTime() - 86400000 * 3).toISOString(), updated_at: new Date(now.getTime() - 86400000 * 3).toISOString() },
  { id: 'req-2', customer_id: 'customer-2', who_needs_support: 'me', category: 'community', meeting_location: '456 Maple Ave', destination: 'Community Center, 200 Main St', date: '2026-06-12', time: '14:00', duration: 'under-2', description: 'Need help getting to community center for a workshop.', accessibility_needs: 'wheelchair-accessible', gender_preference: 'no-preference', language_preference: 'spanish', status: 'awaiting-matching', assigned_partner_id: null, created_at: new Date(now.getTime() - 86400000 * 2).toISOString(), updated_at: new Date(now.getTime() - 86400000 * 2).toISOString() },
  { id: 'req-3', customer_id: 'customer-3', who_needs_support: 'me', category: 'travel', meeting_location: '789 Pine Rd', destination: 'International Airport, Terminal 3', date: '2026-06-15', time: '06:30', duration: 'under-2', description: 'Early morning airport drop-off and gate assistance.', accessibility_needs: '', gender_preference: 'male', language_preference: 'english', status: 'matched', assigned_partner_id: 'partner-2', created_at: new Date(now.getTime() - 86400000 * 5).toISOString(), updated_at: new Date(now.getTime() - 86400000 * 1).toISOString() },
  { id: 'req-4', customer_id: 'customer-4', who_needs_support: 'me', category: 'medical', meeting_location: '12 Cherry Blossom Ln', destination: 'St. Mary\'s Hospital, 500 Health Park Dr', date: '2026-06-08', time: '10:00', duration: '2-4', description: 'Follow-up appointment after surgery. Need translation support.', accessibility_needs: '', gender_preference: 'female', language_preference: 'cantonese', status: 'in-progress', assigned_partner_id: 'partner-3', created_at: new Date(now.getTime() - 86400000 * 7).toISOString(), updated_at: new Date(now.getTime() - 86400000 * 0.5).toISOString() },
  { id: 'req-5', customer_id: 'customer-5', who_needs_support: 'me', category: 'medical', meeting_location: '55 Lakeview Dr', destination: 'Downtown Medical Center, 300 Physician Blvd', date: '2026-06-05', time: '11:00', duration: 'under-2', description: 'Regular checkup with my primary care physician.', accessibility_needs: '', gender_preference: 'no-preference', language_preference: 'english', status: 'completed', assigned_partner_id: 'partner-1', created_at: new Date(now.getTime() - 86400000 * 14).toISOString(), updated_at: new Date(now.getTime() - 86400000 * 12).toISOString() },
  { id: 'req-6', customer_id: 'customer-1', who_needs_support: 'me', category: 'errands', meeting_location: '123 Oak St, Apt 4B', destination: 'Various locations', date: '2026-06-18', time: '13:00', duration: '2-4', description: 'Need help with grocery shopping and pharmacy pick-up.', accessibility_needs: 'limited-walking', gender_preference: 'female', language_preference: 'english', status: 'partner-en-route', assigned_partner_id: 'partner-5', created_at: new Date(now.getTime() - 86400000 * 1).toISOString(), updated_at: new Date(now.getTime() - 86400000 * 0.2).toISOString() },
  { id: 'req-7', customer_id: 'customer-2', who_needs_support: 'me', category: 'elderly', meeting_location: '456 Maple Ave', destination: 'Sunrise Senior Center, 800 Golden Years Dr', date: '2026-06-20', time: '10:00', duration: '2-4', description: 'Visit to senior center for weekly social event.', accessibility_needs: 'wheelchair-accessible', gender_preference: 'no-preference', language_preference: 'spanish', status: 'pending', assigned_partner_id: null, created_at: now.toISOString(), updated_at: now.toISOString() },
  { id: 'req-8', customer_id: 'customer-3', who_needs_support: 'me', category: 'medical', meeting_location: '789 Pine Rd', destination: 'EyeCare Specialists, 450 Vision Way', date: '2026-06-22', time: '15:00', duration: 'under-2', description: 'Eye exam appointment - might need dilation so cannot drive.', accessibility_needs: '', gender_preference: 'no-preference', language_preference: 'english', status: 'confirmed', assigned_partner_id: 'partner-7', created_at: new Date(now.getTime() - 86400000 * 4).toISOString(), updated_at: new Date(now.getTime() - 86400000 * 2).toISOString() },
];

const insertRequest = db.prepare(`INSERT INTO support_requests (id, customer_id, who_needs_support, someone_else_name, someone_else_phone, someone_else_relationship, category, other_category_description, meeting_location, destination, date, time, duration, description, accessibility_needs, gender_preference, language_preference, status, assigned_partner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
for (const r of requests) {
  insertRequest.run(r.id, r.customer_id, r.who_needs_support, null, null, null, r.category, null, r.meeting_location, r.destination, r.date, r.time, r.duration, r.description, r.accessibility_needs, r.gender_preference, r.language_preference, r.status, r.assigned_partner_id, r.created_at, r.updated_at);
}

// Matches
const matches = [
  { id: 'match-1', request_id: 'req-1', partner_id: 'partner-1', customer_id: 'customer-1', status: 'pending', matched_at: new Date(now.getTime() - 86400000 * 2).toISOString(), confirmed_at: null, reason_for_match: '["Female companion requested","Medical appointment expertise","High rating (4.9)","Patient and calm demeanor"]', customer_approved: 0 },
  { id: 'match-2', request_id: 'req-1', partner_id: 'partner-3', customer_id: 'customer-1', status: 'pending', matched_at: new Date(now.getTime() - 86400000 * 2).toISOString(), confirmed_at: null, reason_for_match: '["Female companion requested","Extensive medical support experience","Highest rating (4.95)","Multilingual - additional language support if needed"]', customer_approved: 0 },
  { id: 'match-3', request_id: 'req-1', partner_id: 'partner-5', customer_id: 'customer-1', status: 'pending', matched_at: new Date(now.getTime() - 86400000 * 2).toISOString(), confirmed_at: null, reason_for_match: '["Female companion requested","Medical and travel expertise","Calm, reassuring presence"]', customer_approved: 0 },
  { id: 'match-4', request_id: 'req-3', partner_id: 'partner-2', customer_id: 'customer-3', status: 'confirmed', matched_at: new Date(now.getTime() - 86400000 * 3).toISOString(), confirmed_at: new Date(now.getTime() - 86400000 * 1).toISOString(), reason_for_match: '["Male companion requested","Available at requested time","Experienced with travel support"]', customer_approved: 1 },
  { id: 'match-5', request_id: 'req-4', partner_id: 'partner-3', customer_id: 'customer-4', status: 'confirmed', matched_at: new Date(now.getTime() - 86400000 * 5).toISOString(), confirmed_at: new Date(now.getTime() - 86400000 * 4).toISOString(), reason_for_match: '["Female companion requested","Medical appointment expertise","Highest rating (4.95)","No language match but multilingual approach"]', customer_approved: 1 },
  { id: 'match-6', request_id: 'req-6', partner_id: 'partner-5', customer_id: 'customer-1', status: 'confirmed', matched_at: new Date(now.getTime() - 86400000 * 0.5).toISOString(), confirmed_at: new Date(now.getTime() - 86400000 * 0.3).toISOString(), reason_for_match: '["Female companion requested","Experienced with errands and shopping","Calm and reassuring presence"]', customer_approved: 1 },
  { id: 'match-7', request_id: 'req-5', partner_id: 'partner-1', customer_id: 'customer-5', status: 'confirmed', matched_at: new Date(now.getTime() - 86400000 * 13).toISOString(), confirmed_at: new Date(now.getTime() - 86400000 * 12).toISOString(), reason_for_match: '["Available at requested time","Medical support expertise","High rating (4.9)"]', customer_approved: 1 },
  { id: 'match-8', request_id: 'req-8', partner_id: 'partner-7', customer_id: 'customer-3', status: 'confirmed', matched_at: new Date(now.getTime() - 86400000 * 3).toISOString(), confirmed_at: new Date(now.getTime() - 86400000 * 2).toISOString(), reason_for_match: '["Available at requested time","Steady and dependable","Experienced with medical errands"]', customer_approved: 1 },
];

const insertMatch = db.prepare(`INSERT INTO matches (id, request_id, partner_id, customer_id, status, matched_at, confirmed_at, reason_for_match, customer_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
for (const m of matches) {
  insertMatch.run(m.id, m.request_id, m.partner_id, m.customer_id, m.status, m.matched_at, m.confirmed_at, m.reason_for_match, m.customer_approved);
}

// Journey Messages
const messagesData = [
  { id: 'msg-1', request_id: 'req-4', from_type: 'partner', sender_name: 'Priya Sharma', content: 'Hello! I\'m Priya, your companion for tomorrow\'s hospital visit. I\'ll be at your place at 9:30 AM. Please let me know if you need anything!', timestamp: new Date(now.getTime() - 86400000 * 0.8).toISOString() },
  { id: 'msg-2', request_id: 'req-4', from_type: 'customer', sender_name: 'Emily Chen', content: 'Thank you Priya! I\'ll be ready. I really appreciate the help.', timestamp: new Date(now.getTime() - 86400000 * 0.7).toISOString() },
  { id: 'msg-3', request_id: 'req-4', from_type: 'partner', sender_name: 'Priya Sharma', content: 'Of course! I\'ve reviewed your appointment details. The check-in is at 10 AM, so we have plenty of time.', timestamp: new Date(now.getTime() - 86400000 * 0.6).toISOString() },
  { id: 'msg-4', request_id: 'req-5', from_type: 'partner', sender_name: 'Aisha Mohammed', content: 'Good morning! I\'m on my way to pick you up. See you soon!', timestamp: new Date(now.getTime() - 86400000 * 13).toISOString() },
  { id: 'msg-5', request_id: 'req-5', from_type: 'customer', sender_name: 'David Williams', content: 'Great, see you soon!', timestamp: new Date(now.getTime() - 86400000 * 13).toISOString() },
  { id: 'msg-6', request_id: 'req-3', from_type: 'partner', sender_name: 'Carlos Mendez', content: 'Hi James! Just confirming our airport trip this Friday. I\'ll pick you up at 6 AM sharp!', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString() },
  { id: 'msg-7', request_id: 'req-3', from_type: 'customer', sender_name: 'James Kim', content: 'Perfect, thanks Carlos!', timestamp: new Date(now.getTime() - 86400000 * 1.5).toISOString() },
  { id: 'msg-8', request_id: 'req-6', from_type: 'partner', sender_name: 'Yuki Tanaka', content: 'Hello Sarah! I\'m heading over now for our grocery trip. See you in 20 minutes!', timestamp: new Date(now.getTime() - 86400000 * 0.1).toISOString() },
];

const insertMessage = db.prepare(`INSERT INTO journey_messages (id, request_id, from_type, sender_name, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)`);
for (const m of messagesData) {
  insertMessage.run(m.id, m.request_id, m.from_type, m.sender_name, m.content, m.timestamp);
}

// Payments
const paymentsData = [
  { id: 'pay-1', request_id: 'req-5', customer_id: 'customer-5', amount: 45, base_fee: 35, additional_time_fee: 10, status: 'completed', created_at: new Date(now.getTime() - 86400000 * 14).toISOString(), completed_at: new Date(now.getTime() - 86400000 * 12).toISOString() },
  { id: 'pay-2', request_id: 'req-4', customer_id: 'customer-4', amount: 75, base_fee: 55, additional_time_fee: 20, status: 'completed', created_at: new Date(now.getTime() - 86400000 * 7).toISOString(), completed_at: new Date(now.getTime() - 86400000 * 6).toISOString() },
  { id: 'pay-3', request_id: 'req-3', customer_id: 'customer-3', amount: 35, base_fee: 35, additional_time_fee: 0, status: 'pending', created_at: new Date(now.getTime() - 86400000 * 5).toISOString(), completed_at: null },
  { id: 'pay-4', request_id: 'req-8', customer_id: 'customer-3', amount: 35, base_fee: 35, additional_time_fee: 0, status: 'pending', created_at: new Date(now.getTime() - 86400000 * 4).toISOString(), completed_at: null },
  { id: 'pay-5', request_id: 'req-6', customer_id: 'customer-1', amount: 55, base_fee: 45, additional_time_fee: 10, status: 'pending', created_at: new Date(now.getTime() - 86400000 * 1).toISOString(), completed_at: null },
];

const insertPayment = db.prepare(`INSERT INTO payments (id, request_id, customer_id, amount, base_fee, additional_time_fee, status, created_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
for (const p of paymentsData) {
  insertPayment.run(p.id, p.request_id, p.customer_id, p.amount, p.base_fee, p.additional_time_fee, p.status, p.created_at, p.completed_at);
}

// Operation Events
const opsEvents = [
  { id: 'op-1', request_id: 'req-1', type: 'created', content: 'Request received and logged into system', operator_name: 'System', timestamp: new Date(now.getTime() - 86400000 * 3).toISOString() },
  { id: 'op-2', request_id: 'req-1', type: 'ai-analysis', content: 'AI analysis complete: Medical appointment, female companion recommended', operator_name: 'AI Engine', timestamp: new Date(now.getTime() - 86400000 * 3).toISOString() },
  { id: 'op-3', request_id: 'req-1', type: 'matching', content: 'Matching initiated - 3 potential partners identified', operator_name: 'System', timestamp: new Date(now.getTime() - 86400000 * 2.5).toISOString() },
  { id: 'op-4', request_id: 'req-1', type: 'note', content: 'Customer has requested female companion due to personal comfort', operator_name: 'Alex Rivera (Lead)', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString() },
  { id: 'op-5', request_id: 'req-2', type: 'created', content: 'Request received and logged into system', operator_name: 'System', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString() },
  { id: 'op-6', request_id: 'req-2', type: 'ai-analysis', content: 'AI analysis complete: Community event, wheelchair accessible route needed', operator_name: 'AI Engine', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString() },
  { id: 'op-7', request_id: 'req-3', type: 'created', content: 'Request received and logged into system', operator_name: 'System', timestamp: new Date(now.getTime() - 86400000 * 5).toISOString() },
  { id: 'op-8', request_id: 'req-3', type: 'ai-analysis', content: 'AI analysis complete: Travel support, early morning airport assistance', operator_name: 'AI Engine', timestamp: new Date(now.getTime() - 86400000 * 5).toISOString() },
  { id: 'op-9', request_id: 'req-3', type: 'matched', content: 'Matched with Carlos Mendez - confirmed by customer', operator_name: 'AI Engine', timestamp: new Date(now.getTime() - 86400000 * 1).toISOString() },
  { id: 'op-10', request_id: 'req-6', type: 'created', content: 'Request received and logged into system', operator_name: 'System', timestamp: new Date(now.getTime() - 86400000 * 1).toISOString() },
  { id: 'op-11', request_id: 'req-6', type: 'ai-analysis', content: 'AI analysis complete: Errand support - grocery and pharmacy', operator_name: 'AI Engine', timestamp: new Date(now.getTime() - 86400000 * 1).toISOString() },
  { id: 'op-12', request_id: 'req-6', type: 'matched', content: 'Matched with Yuki Tanaka - confirmed by customer', operator_name: 'AI Engine', timestamp: new Date(now.getTime() - 86400000 * 0.3).toISOString() },
];

const insertOpEvent = db.prepare(`INSERT INTO operation_events (id, request_id, type, content, operator_name, timestamp) VALUES (?, ?, ?, ?, ?, ?)`);
for (const e of opsEvents) {
  insertOpEvent.run(e.id, e.request_id, e.type, e.content, e.operator_name, e.timestamp);
}

// Issues
const issuesData = [
  { id: 'issue-1', request_id: 'req-4', type: 'schedule-change', description: 'Customer needs to reschedule from 10:00 to 11:00 AM', status: 'open', resolved_at: null, resolution: null, created_at: new Date(now.getTime() - 86400000 * 0.5).toISOString() },
];

const insertIssue = db.prepare(`INSERT INTO issues (id, request_id, type, description, status, resolved_at, resolution, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
for (const i of issuesData) {
  insertIssue.run(i.id, i.request_id, i.type, i.description, i.status, i.resolved_at, i.resolution, i.created_at);
}

// Partner Earnings
const earningsData = [
  { id: 'earn-1', partner_id: 'partner-1', request_id: 'req-5', amount: 28, status: 'paid', paid_at: new Date(now.getTime() - 86400000 * 12).toISOString(), created_at: new Date(now.getTime() - 86400000 * 14).toISOString() },
  { id: 'earn-2', partner_id: 'partner-3', request_id: 'req-4', amount: 48, status: 'paid', paid_at: new Date(now.getTime() - 86400000 * 6).toISOString(), created_at: new Date(now.getTime() - 86400000 * 7).toISOString() },
  { id: 'earn-3', partner_id: 'partner-2', request_id: 'req-3', amount: 22, status: 'pending', paid_at: null, created_at: new Date(now.getTime() - 86400000 * 5).toISOString() },
  { id: 'earn-4', partner_id: 'partner-7', request_id: 'req-8', amount: 22, status: 'pending', paid_at: null, created_at: new Date(now.getTime() - 86400000 * 4).toISOString() },
  { id: 'earn-5', partner_id: 'partner-5', request_id: 'req-6', amount: 35, status: 'pending', paid_at: null, created_at: new Date(now.getTime() - 86400000 * 1).toISOString() },
];

const insertEarning = db.prepare(`INSERT INTO partner_earnings (id, partner_id, request_id, amount, status, paid_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);
for (const e of earningsData) {
  insertEarning.run(e.id, e.partner_id, e.request_id, e.amount, e.status, e.paid_at, e.created_at);
}

// Finance Records
const financeData = [
  { id: 'fin-1', request_id: 'req-5', customer_payment: 45, partner_payout: 28, revenue: 17, status: 'completed', created_at: new Date(now.getTime() - 86400000 * 12).toISOString() },
  { id: 'fin-2', request_id: 'req-4', customer_payment: 75, partner_payout: 48, revenue: 27, status: 'completed', created_at: new Date(now.getTime() - 86400000 * 6).toISOString() },
];

const insertFinance = db.prepare(`INSERT INTO finance_records (id, request_id, customer_payment, partner_payout, revenue, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);
for (const f of financeData) {
  insertFinance.run(f.id, f.request_id, f.customer_payment, f.partner_payout, f.revenue, f.status, f.created_at);
}

// AI Analyses
const aiData = [
  { id: 'ai-1', request_id: 'req-1', tags: '["prenatal","medical-appointment","female-preferred","morning"]', classification: 'Medical Support', risk_flags: '[]', analyzed_at: new Date(now.getTime() - 86400000 * 3).toISOString() },
  { id: 'ai-2', request_id: 'req-2', tags: '["community","wheelchair","social","spanish"]', classification: 'Community & Social', risk_flags: '["accessibility-required"]', analyzed_at: new Date(now.getTime() - 86400000 * 2).toISOString() },
  { id: 'ai-3', request_id: 'req-3', tags: '["airport","travel","early-morning","male-preferred"]', classification: 'Travel Support', risk_flags: '["early-hour","time-sensitive"]', analyzed_at: new Date(now.getTime() - 86400000 * 5).toISOString() },
  { id: 'ai-4', request_id: 'req-4', tags: '["surgery-followup","medical","cantonese","hospital"]', classification: 'Medical Support', risk_flags: '["post-surgery","language-barrier"]', analyzed_at: new Date(now.getTime() - 86400000 * 7).toISOString() },
  { id: 'ai-5', request_id: 'req-5', tags: '["checkup","medical","morning"]', classification: 'Medical Support', risk_flags: '[]', analyzed_at: new Date(now.getTime() - 86400000 * 14).toISOString() },
  { id: 'ai-6', request_id: 'req-6', tags: '["grocery","pharmacy","errands","female-preferred","afternoon"]', classification: 'Errands & Daily Tasks', risk_flags: '["limited-walking"]', analyzed_at: new Date(now.getTime() - 86400000 * 1).toISOString() },
  { id: 'ai-7', request_id: 'req-7', tags: '["senior","social","wheelchair","spanish"]', classification: 'Elderly Care', risk_flags: '["accessibility-required"]', analyzed_at: now.toISOString() },
  { id: 'ai-8', request_id: 'req-8', tags: '["eye-exam","medical","afternoon","driving-restriction"]', classification: 'Medical Support', risk_flags: '["post-procedure-driving-restriction"]', analyzed_at: new Date(now.getTime() - 86400000 * 4).toISOString() },
];

const insertAi = db.prepare(`INSERT INTO ai_analyses (id, request_id, tags, classification, risk_flags, analyzed_at) VALUES (?, ?, ?, ?, ?, ?)`);
for (const a of aiData) {
  insertAi.run(a.id, a.request_id, a.tags, a.classification, a.risk_flags, a.analyzed_at);
}

// Create default sessions for demo users
const sessions = [
  { id: 'sess-customer', role: 'customer', user_name: 'Sarah Johnson', created_at: new Date().toISOString() },
  { id: 'sess-partner', role: 'partner', user_name: 'Aisha Mohammed', created_at: new Date().toISOString() },
  { id: 'sess-ops', role: 'ops', user_name: 'Alex Rivera', created_at: new Date().toISOString() },
];

const insertSession = db.prepare(`INSERT INTO sessions (id, role, user_name, created_at) VALUES (?, ?, ?, ?)`);
for (const s of sessions) {
  insertSession.run(s.id, s.role, s.user_name, s.created_at);
}

console.log('✅ Database seeded successfully');
console.log(`  - ${customers.length} customers`);
console.log(`  - ${partners.length} support partners`);
console.log(`  - ${requests.length} support requests`);
console.log(`  - ${matches.length} matches`);
console.log(`  - ${messagesData.length} journey messages`);
console.log(`  - ${paymentsData.length} payments`);
console.log(`  - ${opsEvents.length} operation events`);
console.log(`  - ${issuesData.length} issues`);
console.log(`  - ${earningsData.length} partner earnings`);
console.log(`  - ${financeData.length} finance records`);
console.log(`  - ${aiData.length} AI analyses`);
console.log(`  - ${sessions.length} sessions`);

console.log('\n🔑 Demo login sessions:');
console.log('  Customer:  sess-customer  →  Sarah Johnson');
console.log('  Partner:   sess-partner   →  Aisha Mohammed');
console.log('  Ops:       sess-ops       →  Alex Rivera');

process.exit(0);
