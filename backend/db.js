require('dotenv').config();
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  queueLimit: 0
};

let db;
let secondDB;

async function connectSecondDB() {
  try {
    const secondDbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'agent_dashboard', // Replace with actual name
      connectionLimit: 10,
      queueLimit: 0
    };
    
    secondDB = await mysql.createConnection(secondDbConfig);
    console.log('✅ Second Database Connected');
    return secondDB;
  } catch (err) {
    console.error('❌ Second database connection failed:', err);
    throw err;
  }
}
async function connectDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL Connected');
    
    // Initialize tables if they don't exist
    await initDB();
    return db;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
}

async function initDB() {
  // Create contacts table if it doesn't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      lead_owner VARCHAR(255),
      author VARCHAR(255),
      publisher VARCHAR(255),
      book_title VARCHAR(255),
      status ENUM('new', 'contacted', 'qualified', 'lost') DEFAULT 'new',
      assigned_to INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Create users table if it doesn't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'agent') DEFAULT 'agent',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// module.exports = {
//   connectDB,
//   getDB: () => db
// };

module.exports = {
  connectDB,
  connectSecondDB, // Add this
  getDB: () => db,
  getSecondDB: () => secondDB // Add this
};