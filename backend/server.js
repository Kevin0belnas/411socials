require("dotenv").config();
const express = require('express');
const cors = require('cors');
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const { pool, connectDB, connectSecondDB } = require("./db");
const routes = require('./routes');
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Session store options - Updated configuration
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
}, pool); // Pass the pool as the second argument   

// Session middleware - Updated configuration
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
    maxAge: 1000 * 60 * 60 * 24  // 24 hours in milliseconds
  },
  })
);

app.use((req, res, next) => {
  // console.log('=== SESSION DEBUGGING ===');
  // console.log('Session ID:', req.sessionID);
  // console.log('Session data:', req.session);
  // console.log('Cookies:', req.headers.cookie);
  // console.log('Origin:', req.headers.origin);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.68.10:5173",
  "https://nn6fwsg5-5173.asse.devtunnels.ms"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`Blocked by CORS: ${origin}`);
        callback(new Error(`Not allowed by CORS. Allowed origins: ${allowedOrigins.join(', ')}`));
      }
    },
    credentials: true,
    exposedHeaders: ['set-cookie'] // If you need to expose cookies
  })
);
// Static uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Force download for certain file types if needed
    if (filePath.endsWith('.pdf') || filePath.endsWith('.docx')) {
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

// Routes
app.use("/api", routes);

connectDB();
connectSecondDB();

// 🧹 Automatically delete assignment history older than 30 days every 24 hours
setInterval(async () => {
  try {
    const db = await pool.promise();
    const [result] = await db.execute(
      'DELETE FROM assignment_history WHERE assigned_at < NOW() - INTERVAL 30 DAY'
    );
    console.log(`[CLEANUP] Deleted ${result.affectedRows} old assignment_history records.`);
  } catch (err) {
    console.error('[CLEANUP ERROR] Failed to delete old assignment history:', err.message);
  }
}, 1000 * 60 * 60 * 24); // Runs every 24 hours


app.listen(5000, "0.0.0.0", () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  
});
