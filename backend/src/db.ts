import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'withh.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initializeDatabase(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      gender_preference TEXT DEFAULT 'no-preference',
      language_preference TEXT DEFAULT 'no-preference',
      repeat_partner_ids TEXT DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trusted_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      relationship TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS support_partners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      gender TEXT NOT NULL,
      languages TEXT DEFAULT '[]',
      completed_journeys INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 1,
      bio TEXT DEFAULT '',
      specialties TEXT DEFAULT '[]',
      available INTEGER DEFAULT 1,
      rating REAL DEFAULT 0,
      joined_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS support_requests (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      who_needs_support TEXT DEFAULT 'me',
      someone_else_name TEXT,
      someone_else_phone TEXT,
      someone_else_relationship TEXT,
      category TEXT NOT NULL,
      other_category_description TEXT,
      meeting_location TEXT NOT NULL,
      destination TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration TEXT DEFAULT 'under-2',
      description TEXT DEFAULT '',
      accessibility_needs TEXT DEFAULT '',
      gender_preference TEXT DEFAULT 'no-preference',
      language_preference TEXT DEFAULT 'no-preference',
      trusted_contact_name TEXT,
      trusted_contact_phone TEXT,
      trusted_contact_relationship TEXT,
      status TEXT DEFAULT 'submitted',
      assigned_partner_id TEXT,
      match_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (assigned_partner_id) REFERENCES support_partners(id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      partner_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      matched_at TEXT NOT NULL,
      confirmed_at TEXT,
      reason_for_match TEXT DEFAULT '[]',
      customer_approved INTEGER DEFAULT 0,
      FOREIGN KEY (request_id) REFERENCES support_requests(id),
      FOREIGN KEY (partner_id) REFERENCES support_partners(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS journey_messages (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      from_type TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES support_requests(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      amount REAL NOT NULL,
      base_fee REAL NOT NULL,
      additional_time_fee REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (request_id) REFERENCES support_requests(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS operation_events (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      operator_name TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES support_requests(id)
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      resolved_at TEXT,
      resolution TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES support_requests(id)
    );

    CREATE TABLE IF NOT EXISTS partner_earnings (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL,
      request_id TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      paid_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (partner_id) REFERENCES support_partners(id),
      FOREIGN KEY (request_id) REFERENCES support_requests(id)
    );

    CREATE TABLE IF NOT EXISTS finance_records (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      customer_payment REAL NOT NULL,
      partner_payout REAL NOT NULL,
      revenue REAL NOT NULL,
      status TEXT DEFAULT 'completed',
      created_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES support_requests(id)
    );

    CREATE TABLE IF NOT EXISTS ai_analyses (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      classification TEXT NOT NULL,
      risk_flags TEXT DEFAULT '[]',
      analyzed_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES support_requests(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      user_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS refunds (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      amount REAL NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      approved_by TEXT,
      approved_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES support_requests(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS availability_slots (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      recurring INTEGER DEFAULT 1,
      specific_date TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (partner_id) REFERENCES support_partners(id)
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      referrer_id TEXT NOT NULL,
      referrer_role TEXT NOT NULL,
      referred_email TEXT,
      referred_phone TEXT,
      code TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'pending',
      reward_amount REAL DEFAULT 0,
      reward_claimed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      claimed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS recurring_bookings (
      id TEXT PRIMARY KEY,
      original_request_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      partner_id TEXT,
      frequency TEXT NOT NULL,
      day_of_week INTEGER,
      day_of_month INTEGER,
      start_date TEXT NOT NULL,
      end_date TEXT,
      next_occurrence TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (original_request_id) REFERENCES support_requests(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (partner_id) REFERENCES support_partners(id)
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      balance_after REAL NOT NULL,
      description TEXT,
      reference_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS ai_feedback (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      feedback_type TEXT NOT NULL,
      rating INTEGER,
      correct INTEGER DEFAULT 1,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES support_requests(id)
    );

    CREATE TABLE IF NOT EXISTS promo_codes (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_amount REAL DEFAULT 0,
      max_uses INTEGER DEFAULT 100,
      current_uses INTEGER DEFAULT 0,
      expires_at TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ops_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'operator',
      permissions TEXT DEFAULT '[]',
      active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  const hasBgCheck = (db.pragma('table_info(support_partners)') as any[]).some((col: any) => col.name === 'bg_check_status');
  if (!hasBgCheck) {
    db.exec(`ALTER TABLE support_partners ADD COLUMN bg_check_status TEXT DEFAULT 'pending'`);
  }

  const hasDocTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='partner_documents'").get();
  if (!hasDocTable) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS partner_documents (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL,
        type TEXT NOT NULL,
        filename TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        verified_at TEXT,
        uploaded_at TEXT NOT NULL,
        FOREIGN KEY (partner_id) REFERENCES support_partners(id)
      );
      CREATE TABLE IF NOT EXISTS support_tickets (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        partner_id TEXT,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        priority TEXT DEFAULT 'medium',
        assigned_to TEXT,
        created_at TEXT NOT NULL,
        resolved_at TEXT
      );
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        sender_type TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id)
      );
    `);
  }
}
