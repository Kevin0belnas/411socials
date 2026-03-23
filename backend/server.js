// require("dotenv").config();
// const express = require('express');
// const cors = require('cors');
// const session = require("express-session");
// const MySQLStore = require("express-mysql-session")(session);
// const { pool, connectDB, connectSecondDB } = require("./db");
// const routes = require('./routes');
// const path = require("path");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Session store options - Updated configuration
// const sessionStore = new MySQLStore({
//   host: process.env.DB_HOST || '192.168.68.33',
//   port: process.env.DB_PORT || 3306,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   createDatabaseTable: true,
//   schema: {
//     tableName: 'sessions',
//     columnNames: {
//       session_id: 'session_id',
//       expires: 'expires',
//       data: 'data'
//     }
//   }
// }, pool); // Pass the pool as the second argument   

// // Session middleware - Updated configuration
// app.use(
//   session({
//     key: "session_cookie_name",
//     secret: process.env.SESSION_SECRET || "your-secret-key",
//     store: sessionStore,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//     path: "/",
//     httpOnly: true,
//     secure: false,
//     sameSite: "lax",
//     maxAge: 1000 * 60 * 60 * 24  // 24 hours in milliseconds
//   },
//   })
// );

// app.use((req, res, next) => {
//   // console.log('=== SESSION DEBUGGING ===');
//   // console.log('Session ID:', req.sessionID);
//   // console.log('Session data:', req.session);
//   // console.log('Cookies:', req.headers.cookie);
//   // console.log('Origin:', req.headers.origin);
//   next();
// });

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const allowedOrigins = [
//   "http://localhost:5174",
//   "http://192.168.68.77:5174",
//   "https://nn6fwsg5-5174.asse.devtunnels.ms"
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
      
//       if (allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         console.log(`Blocked by CORS: ${origin}`);
//         callback(new Error(`Not allowed by CORS. Allowed origins: ${allowedOrigins.join(', ')}`));
//       }
//     },
//     credentials: true,
//     exposedHeaders: ['set-cookie'] // If you need to expose cookies
//   })
// );
// // Static uploads
// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
//   setHeaders: (res, filePath) => {
//     // Force download for certain file types if needed
//     if (filePath.endsWith('.pdf') || filePath.endsWith('.docx')) {
//       res.setHeader('Content-Disposition', 'attachment');
//     }
//   }
// }));

// // Routes
// app.use("/api", routes);

// connectDB();
// connectSecondDB();

// // 🧹 Automatically delete assignment history older than 30 days every 24 hours
// setInterval(async () => {
//   try {
//     const db = await pool.promise();
//     const [result] = await db.execute(
//       'DELETE FROM assignment_history WHERE assigned_at < NOW() - INTERVAL 30 DAY'
//     );
//     console.log(`[CLEANUP] Deleted ${result.affectedRows} old assignment_history records.`);
//   } catch (err) {
//     console.error('[CLEANUP ERROR] Failed to delete old assignment history:', err.message);
//   }
// }, 1000 * 60 * 60 * 24); // Runs every 24 hours


// app.listen(5000, "0.0.0.0", () => {
//     console.log(`🚀 Server is running on http://localhost:${PORT}`);
  
// });


require("dotenv").config();
const express = require('express');
const cors = require('cors');
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const { pool, getDB, connectDB, connectSecondDB } = require("./db");
const routes = require('./routes');
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Session store options
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || '192.168.68.33',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool);

// Session middleware
app.use(
  session({
    key: "session_cookie_name",
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24
    },
  })
);

app.use((req, res, next) => {
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5174",
  "http://192.168.68.6:5174",
  "https://nn6fwsg5-5174.asse.devtunnels.ms"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`Blocked by CORS: ${origin}`);
        callback(new Error(`Not allowed by CORS`));
      }
    },
    credentials: true,
    exposedHeaders: ['set-cookie']
  })
);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf') || filePath.endsWith('.docx')) {
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

// Routes
app.use("/api", routes);

// ======================
// AUTO RESET FUNCTION
// ======================

// Function to check and reset leads older than 7 days
// Function to check and reset leads older than 7 days
async function resetOldLeads() {
  let retries = 3;
  
  while (retries > 0) {
    try {
      // Try to get database connection
      const db = getDB();
      
      if (!db) {
        console.log(`⏳ Waiting for database connection... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries--;
        continue;
      }
      
      console.log('🔄 Checking for leads older than 7 days...', new Date().toISOString());
      
      // 1. Reset leads that are NOT completed and older than 7 days
      const [result] = await db.execute(`
        UPDATE contacts 
        SET status = 'New',
            rating = NULL,
            assigned_to = NULL,
            lead_owner = NULL
        WHERE status != 'Completed'
        AND (
          rating = 'Flagged' 
          OR rating = 'Decline'
          OR status = 'Contacted'
          OR status = 'In Progress'
        )
        AND updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);
      
      // 2. Reset leads based on assignment_history (cleared leads)
      // FIXED: Removed GROUP BY and used subquery instead
      const [historyResult] = await db.execute(`
        UPDATE contacts c
        SET c.status = 'New',
            c.rating = NULL,
            c.assigned_to = NULL,
            c.lead_owner = NULL
        WHERE c.status != 'Completed'
        AND c.status = 'Contacted'
        AND c.assigned_to IS NULL
        AND EXISTS (
          SELECT 1 FROM assignment_history ah 
          WHERE ah.lead_id = c.id 
          AND ah.removed_at IS NOT NULL 
          AND ah.removed_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
        )
      `);
      
      const totalReset = result.affectedRows + historyResult.affectedRows;
      
      if (totalReset > 0) {
        console.log(`✅ Auto-reset ${totalReset} leads older than 7 days`);
        console.log(`   - From contacts table: ${result.affectedRows}`);
        console.log(`   - From assignment history: ${historyResult.affectedRows}`);
      } else {
        console.log('✅ No leads needed reset (all leads are within 7 days or completed)');
      }
      
      return totalReset;
      
    } catch (error) {
      console.error('❌ Error resetting old leads:', error.message);
      if (retries === 1) {
        console.error('❌ Failed to reset leads after retries');
        return 0;
      }
      console.log(`⏳ Retrying in 2 seconds... (${retries - 1} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      retries--;
    }
  }
  
  return 0;
}

// 🧹 Clean up old assignment history (runs every 24 hours)
setInterval(async () => {
  try {
    const db = getDB();
    if (!db) return;
    
    const [result] = await db.execute(
      'DELETE FROM assignment_history WHERE assigned_at < NOW() - INTERVAL 30 DAY'
    );
    if (result.affectedRows > 0) {
      console.log(`[CLEANUP] Deleted ${result.affectedRows} old assignment_history records.`);
    }
  } catch (err) {
    console.error('[CLEANUP ERROR]', err.message);
  }
}, 1000 * 60 * 60 * 24); // Runs every 24 hours

// ======================
// DATABASE CONNECTION AND SERVER STARTUP
// ======================

// Connect to databases and start server
async function startServer() {
  try {
    // Connect to databases
    await connectDB();
    await connectSecondDB();
    
    console.log('✅ Databases connected successfully');
    
    // Wait a moment for connections to stabilize
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Run auto-reset after databases are connected
    const resetCount = await resetOldLeads();
    console.log(`📊 Server startup complete. Reset ${resetCount} old leads.`);
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
  
  // Start server regardless of database connection (will retry on requests)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📅 Auto-reset check will run every time server starts`);
  });
}

// Start the server
startServer();

// Export for testing
module.exports = { resetOldLeads };