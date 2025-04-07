-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY,
  country TEXT
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  stock_code TEXT PRIMARY KEY,
  description TEXT
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  invoice_no TEXT,
  invoice_date TIMESTAMP,
  customer_id INT REFERENCES customers(id),
  items JSONB,
  PRIMARY KEY (invoice_no, customer_id)
);

-- Optional index for performance
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
