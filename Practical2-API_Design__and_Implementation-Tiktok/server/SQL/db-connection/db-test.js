const { Pool } = require('pg');

// Create a connection pool – ADJUST YOUR CREDENTIALS AS NEEDED
const pool = new Pool({
    user: 'postgres',         // Default PostgreSQL user (adjust if different)
    host: 'localhost',        // Database host
    database: 'student_records', // Database name
    password: 'somchoki@2005',             // Add your password if you've set one
    port: 1234                // Default PostgreSQL port
});

// Test the connection and run a query
async function testConnection() {
    let client;

    try {
        // Get a client from the pool
        client = await pool.connect();
        console.log('Connected to PostgreSQL database!');

        // Run a simple query
        const result = await client.query('SELECT * FROM students');

        // Print the results
        console.log('Students in database:');
        console.table(result.rows);

        // Count rows
        console.log(`Total students: ${result.rowCount}`);
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        // Release the client back to the pool
        if (client) client.release();

        // Close the pool
        await pool.end();
        console.log('Connection pool closed');
    }
}

// Run the test
testConnection();