import mysql from 'mysql2';

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',  // Update this with your MySQL host
    user: 'root',       // Update with your MySQL user
    password: 'root',       // Update with your MySQL password
    database: 'mysql' // Update with your database name
});

// Create a table to store menus if it doesn't exist
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS menus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(255) NOT NULL
    );
`;

pool.query(createTableQuery, (err) => {
    if (err) throw err;
    console.log('Menus table is ready!');
});

export default pool;