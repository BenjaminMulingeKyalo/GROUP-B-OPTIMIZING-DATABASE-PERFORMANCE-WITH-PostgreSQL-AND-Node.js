require('dotenv').config();
const fs = require('fs');
const { parse } = require('csv-parse');
const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
});

const customers = new Map();
const products = new Map();
const invoices = new Map();

function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime()); // Validate date format
}

fs.createReadStream('online_retail.csv')
    .pipe(parse({ columns: true }))
    .on('data', (row) => {
        const { InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID, Country } = row;

        if (!InvoiceNo || !CustomerID || !StockCode) return;

        // Add customer
        if (!customers.has(CustomerID)) {
            customers.set(CustomerID, { id: CustomerID, country: Country });
        }

        // Add product
        if (!products.has(StockCode)) {
            products.set(StockCode, { stock_code: StockCode, description: Description, unit_price: parseFloat(UnitPrice) || 0 });
        }

        // Validate and process invoice date
        const invoiceDate = isValidDate(InvoiceDate) ? new Date(InvoiceDate) : new Date('1970-01-01');

        // Group items into invoices
        if (!invoices.has(InvoiceNo)) {
            invoices.set(InvoiceNo, { invoice_no: InvoiceNo, customer_id: CustomerID, invoice_date: invoiceDate, items: [] });
        }

        invoices.get(InvoiceNo).items.push({
            product_id: StockCode,
            quantity: parseInt(Quantity, 10) || 0,
            unit_price: parseFloat(UnitPrice) || 0
        });
    })
    .on('end', async () => {
        console.log('CSV parsed. Starting database inserts...');

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert customers
            for (const customer of customers.values()) {
                await client.query(
                    'INSERT INTO customers (id, country) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [customer.id, customer.country]
                );
            }

            // Insert products
            for (const product of products.values()) {
                await client.query(
                    'INSERT INTO products (stock_code, description, unit_price) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                    [product.stock_code, product.description, product.unit_price]
                );
            }

            // Insert invoices with conflict handling
            for (const invoice of invoices.values()) {
                await client.query(
                    `INSERT INTO invoices (invoice_no, customer_id, invoice_date, items)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (invoice_no, customer_id) DO UPDATE
                    SET invoice_date = EXCLUDED.invoice_date, items = EXCLUDED.items`,
                    [invoice.invoice_no, invoice.customer_id, invoice.invoice_date, JSON.stringify(invoice.items)]
                );
            }

            await client.query('COMMIT');
            console.log('Data inserted successfully!');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error inserting data:', err);
        } finally {
            client.release();
        }
    })
    .on('error', (err) => {
        console.error('Error reading CSV file:', err);
    });