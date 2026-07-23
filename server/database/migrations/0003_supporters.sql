-- Migration: Add supporters table for Pakasir payment integration
CREATE TABLE IF NOT EXISTS supporters (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT,
  paid_at INTEGER NOT NULL
);
