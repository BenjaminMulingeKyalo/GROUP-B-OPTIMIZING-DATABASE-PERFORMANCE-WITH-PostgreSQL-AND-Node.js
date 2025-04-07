# GROUP-B-OPTIMIZING-DATABASE-PERFORMANCE-WITH-PostgreSQL-AND-Node.js
Online Retail API
Project Description
The Online Retail API is a backend system designed to manage and optimize retail data using PostgreSQL and Node.js. This project includes:

This project demonstrates database optimization, scalable backend development, and robust API design.

Features


Setup Instructions
Prerequisites

Step 1: Clone the Repository: 
git clone <repository_url>
cd online-retail-api

Step 2: Install Dependencies
npm install

Step 3: Configure Environment Variables

Step 4: Run the ETL Script: node etl.js

This script populates the database with data from .
Step 5: Start the Server: node server.js
The server runs at: http://localhost:5000/

How to Use Endpoints:
•	GET /products: Retrieves all products.
•	GET /products/: stock_code: Fetches a product by stock_code.
•	POST /products: Adds a new product.
•	PUT /products/: stock_code: Updates an existing product.
•	DELETE /products/: stock_code: Deletes a product.


Swagger Documentation
open browser
navigate to http://localhost:5000/api-docs/

Swagger provides an interactive interface to test all API endpoints.

Query Optimization
Stored Procedure
The  procedure computes total sales for a date range:

Trigger
An inventory update trigger adjusts stock levels automatically when an invoice is added.
