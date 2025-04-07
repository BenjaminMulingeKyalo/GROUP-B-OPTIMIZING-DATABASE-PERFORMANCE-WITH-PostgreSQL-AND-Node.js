const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express(); // Initialize Express

// PostgreSQL connection pool setup
const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'your_password',
    database: process.env.PGDATABASE || 'online_retail'
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Online Retail API',
            version: '1.0.0',
            description: 'API documentation for the Online Retail system',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./server.js'], // Points to where Swagger annotations are defined
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Root route to handle "Cannot GET /" error
app.get('/', (req, res) => {
    res.send('Welcome to the Online Retail API! Check /api-docs for documentation.');
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve all products
 *     responses:
 *       200:
 *         description: A list of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
app.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /products/{stock_code}:
 *   get:
 *     summary: Retrieve a product by stock_code
 *     parameters:
 *       - in: path
 *         name: stock_code
 *         required: true
 *         description: The stock_code of the product to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The product data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Product not found
 */
app.get('/products/:stock_code', async (req, res) => {
    const { stock_code } = req.params;
    try {
        const result = await pool.query('SELECT * FROM products WHERE stock_code = $1', [stock_code]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching product by stock_code:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stock_code
 *               - description
 *               - unit_price
 *             properties:
 *               stock_code:
 *                 type: string
 *               description:
 *                 type: string
 *               unit_price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Invalid product data
 */
app.post('/products', async (req, res) => {
    const { stock_code, description, unit_price } = req.body;

    if (!stock_code || !description || isNaN(unit_price)) {
        return res.status(400).json({
            error: 'Invalid product data. Ensure stock_code, description, and numeric unit_price are provided.'
        });
    }

    try {
        await pool.query('INSERT INTO products (stock_code, description, unit_price) VALUES ($1, $2, $3)', [stock_code, description, parseFloat(unit_price)]);
        res.status(201).json({ message: 'Product added successfully!' });
    } catch (err) {
        console.error('Error inserting product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /products/{stock_code}:
 *   put:
 *     summary: Update an existing product
 *     parameters:
 *       - in: path
 *         name: stock_code
 *         required: true
 *         description: The stock_code of the product to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - unit_price
 *             properties:
 *               description:
 *                 type: string
 *               unit_price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
app.put('/products/:stock_code', async (req, res) => {
    const { stock_code } = req.params;
    const { description, unit_price } = req.body;

    if (!description || isNaN(unit_price)) {
        return res.status(400).json({
            error: 'Invalid product data. Ensure description and numeric unit_price are provided.'
        });
    }

    try {
        const result = await pool.query('UPDATE products SET description = $1, unit_price = $2 WHERE stock_code = $3', [description, parseFloat(unit_price), stock_code]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated successfully!' });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /products/{stock_code}:
 *   delete:
 *     summary: Delete a product by stock_code
 *     parameters:
 *       - in: path
 *         name: stock_code
 *         required: true
 *         description: The stock_code of the product to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
app.delete('/products/:stock_code', async (req, res) => {
    const { stock_code } = req.params;

    try {
        const result = await pool.query('DELETE FROM products WHERE stock_code = $1', [stock_code]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully!' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});