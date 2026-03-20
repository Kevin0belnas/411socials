const express = require('express');
const router = express.Router();
const { getDB,getSecondDB } = require('./db');
const jwt = require('jsonwebtoken');

// ======================
// CONTACTS ENDPOINTS
// ======================


// GET /api/current-agents → Now getting agent USERS
router.get('/current-agents', async (req, res) => {
  const db = getDB();

  try {
    const agentId = req.session.userId; // Get the current user's ID from the session
    console.log('Agent ID:', agentId);

    if (!agentId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch the agent's user data based on their ID
    const [results] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [agentId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(results[0]); // return only the first matched user
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.get('/current-agentID', async (req, res) => {
  const db = getDB();

  try {
    // Get user ID from session (you're already doing this)
    const agentId = req.session.userId;

    if (!agentId) {
      return res.status(401).json({ 
        error: 'Not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    // Fetch user data
    const [results] = await db.execute(
      `SELECT 
        id, 
        name, 
        email, 
        role, 
        created_at 
       FROM users 
       WHERE id = ?`,
      [agentId]
    );

    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      });
    }

    // Return minimal necessary data
    res.json({
      id: results[0].id,
      name: results[0].name,
      email: results[0].email,
      role: results[0].role
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// router.get('/contacts', async (req, res) => {
//   const db = getDB();
//   try {
//     const { search, view, assignedTo, page = 1, pageSize = 10 } = req.query;
//     let query = 'SELECT * FROM contacts';
//     const params = [];

//     // WHERE clause filters
//     const whereClauses = [];

//     if (search) {
//       const searchTerm = `%${search.toLowerCase()}%`;
//       const normalizedSearch = search.replace(/[\s()+\-.]/g, ''); // digits-only version

//       const searchConditions = [
//         `LOWER(name) LIKE ?`,
//         `LOWER(email) LIKE ?`,
//         `LOWER(book_title) LIKE ?`
//       ];
//       const searchParams = [searchTerm, searchTerm, searchTerm];

//       // Add normalized phone search if input is numeric
//       if (/^\d+$/.test(normalizedSearch)) {
//         searchConditions.splice(2, 0, `
//           REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', ''), ' ', ''), '+', ''), '.', '') LIKE ?
//         `);
//         searchParams.splice(2, 0, `%${normalizedSearch}%`);
//       } else {
//         // Non-digit input, search phone normally
//         searchConditions.push(`phone LIKE ?`);
//         searchParams.push(searchTerm);
//       }

//       whereClauses.push(`(${searchConditions.join(' OR ')})`);
//       params.push(...searchParams);
//     }

//     if (view === 'unassigned') {
//       whereClauses.push('assigned_to IS NULL');
//     } else if (view === 'my') {
//       whereClauses.push('assigned_to = ?');
//       params.push(1); // TODO: Replace with actual logged-in user ID
//     }

//     if (assignedTo) {
//       whereClauses.push('assigned_to = ?');
//       params.push(assignedTo);
//     }

//     if (whereClauses.length > 0) {
//       query += ' WHERE ' + whereClauses.join(' AND ');
//     }

//     // Total count query
//     const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) AS total');
//     const [countRows] = await db.execute(countQuery, params);
//     const totalCount = countRows[0].total;

//     // Pagination
//     const safeLimit = Math.max(1, parseInt(pageSize) || 10);
//     const safeOffset = Math.max(0, (parseInt(page) - 1) * safeLimit || 0);
//     query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;

//     const [rows] = await db.execute(query, params);

//     // Count assigned/unassigned from current results
//     const assignedCount = rows.filter(r => r.assigned_to).length;
//     const unassignedCount = rows.filter(r => !r.assigned_to).length;

//     res.json({
//       contacts: rows,
//       totalCount,
//       assignedCount,
//       unassignedCount
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.get('/contacts', async (req, res) => {
//   const db = getDB();
//   try {
//     const { search, view, assignedTo, page = 1, pageSize = 10 } = req.query;
//     let query = 'SELECT * FROM contacts';
//     const params = [];

//     // WHERE clause filters
//     const whereClauses = [];
//     if (search) {
//       whereClauses.push(`
//         (name LIKE ? OR 
//          email LIKE ? OR 
//          phone LIKE ? OR 
//          book_title LIKE ?)
//       `);
//       const searchTerm = `%${search}%`;
//       params.push(searchTerm, searchTerm, searchTerm, searchTerm);
//     }

//     if (view === 'unassigned') {
//       whereClauses.push('assigned_to IS NULL');
//     } else if (view === 'my') {
//       whereClauses.push('assigned_to = ?');
//       params.push(1); // TODO: Replace with actual logged-in user ID
//     }

//     if (assignedTo) {
//       whereClauses.push('assigned_to = ?');
//       params.push(assignedTo);
//     }

//     if (whereClauses.length > 0) {
//       query += ' WHERE ' + whereClauses.join(' AND ');
//     }

//     // Total count query
//     const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) AS total');
//     const [countRows] = await db.execute(countQuery, params);
//     const totalCount = countRows[0].total;

//     // Add LIMIT and OFFSET
//     const safeLimit = Math.max(1, parseInt(pageSize) || 10);
//     const safeOffset = Math.max(0, (parseInt(page) - 1) * safeLimit || 0);
//     query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;



//     // const limit = parseInt(pageSize);
//     // const offset = (parseInt(page) - 1) * limit;
//     // query += ' LIMIT ? OFFSET ?';
//     // params.push(limit, offset);

//     const [rows] = await db.execute(query, params);

//     // Count assigned/unassigned
//     const assignedCount = rows.filter(r => r.assigned_to).length;
//     const unassignedCount = rows.filter(r => !r.assigned_to).length;

//     res.json({
//       contacts: rows,
//       totalCount,
//       assignedCount,
//       unassignedCount
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



// Get single contact
// router.get('/contacts', async (req, res) => {
//   const db = getDB();
//   try {
//     const { search, view, assignedTo, status, page = 1, pageSize = 10 } = req.query;
//     let query = 'SELECT * FROM contacts';
//     const params = [];

//     // WHERE clause filters
//     const whereClauses = [];

//     if (search) {
//       const searchTerm = `%${search.toLowerCase()}%`;
//       const normalizedSearch = search.replace(/[\s()+\-.]/g, '');

//       const searchConditions = [
//         `LOWER(name) LIKE ?`,
//         `LOWER(email) LIKE ?`,
//         `LOWER(book_title) LIKE ?`
//       ];
//       const searchParams = [searchTerm, searchTerm, searchTerm];

//       if (/^\d+$/.test(normalizedSearch)) {
//         searchConditions.splice(2, 0, `
//           REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', ''), ' ', ''), '+', ''), '.', '') LIKE ?
//         `);
//         searchParams.splice(2, 0, `%${normalizedSearch}%`);
//       } else {
//         searchConditions.push(`phone LIKE ?`);
//         searchParams.push(searchTerm);
//       }

//       whereClauses.push(`(${searchConditions.join(' OR ')})`);
//       params.push(...searchParams);
//     }

//     // 🔥 FIX: Unassigned view - only show leads that are NOT assigned AND status = 'New'
//     if (view === 'unassigned') {
//       whereClauses.push('assigned_to IS NULL');
//       whereClauses.push('status = "New"');
//     } else if (view === 'my') {
//       whereClauses.push('assigned_to = ?');
//       params.push(req.session.userId || 1);
//     }

//     // Filter by status if provided
//     if (status) {
//       whereClauses.push('status = ?');
//       params.push(status);
//     }

//     if (assignedTo) {
//       whereClauses.push('assigned_to = ?');
//       params.push(assignedTo);
//     }

//     if (whereClauses.length > 0) {
//       query += ' WHERE ' + whereClauses.join(' AND ');
//     }

//     // Total count query
//     const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) AS total');
//     const [countRows] = await db.execute(countQuery, params);
//     const totalCount = countRows[0].total;

//     // Pagination
//     const safeLimit = Math.max(1, parseInt(pageSize) || 10);
//     const safeOffset = Math.max(0, (parseInt(page) - 1) * safeLimit || 0);
//     query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;

//     const [rows] = await db.execute(query, params);

//     // Count assigned/unassigned from current results
//     const assignedCount = rows.filter(r => r.assigned_to).length;
//     const unassignedCount = rows.filter(r => !r.assigned_to && r.status === 'New').length;

//     res.json({
//       contacts: rows,
//       totalCount,
//       assignedCount,
//       unassignedCount
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
router.get('/contacts', async (req, res) => {
  const db = getDB();
  try {
    const { search, view, assignedTo, status, page = 1, pageSize = 10 } = req.query;
    let query = 'SELECT * FROM contacts';
    const params = [];

    // WHERE clause filters
    const whereClauses = [];

    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      const normalizedSearch = search.replace(/[\s()+\-.]/g, '');

      const searchConditions = [
        `LOWER(name) LIKE ?`,
        `LOWER(email) LIKE ?`,
        `LOWER(book_title) LIKE ?`
      ];
      const searchParams = [searchTerm, searchTerm, searchTerm];

      if (/^\d+$/.test(normalizedSearch)) {
        searchConditions.splice(2, 0, `
          REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', ''), ' ', ''), '+', ''), '.', '') LIKE ?
        `);
        searchParams.splice(2, 0, `%${normalizedSearch}%`);
      } else {
        searchConditions.push(`phone LIKE ?`);
        searchParams.push(searchTerm);
      }

      whereClauses.push(`(${searchConditions.join(' OR ')})`);
      params.push(...searchParams);
    }

    // Unassigned view - only show leads that are NOT assigned AND status = 'New'
    if (view === 'unassigned') {
      whereClauses.push('assigned_to IS NULL');
      whereClauses.push('status = "New"');
    } else if (view === 'my') {
      whereClauses.push('assigned_to = ?');
      params.push(req.session.userId || 1);
    }

    // Filter by status if provided
    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (assignedTo) {
      whereClauses.push('assigned_to = ?');
      params.push(assignedTo);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // 🔥 FIX: Add ORDER BY id DESC to show newest first
    query += ' ORDER BY id DESC';

    // Total count query
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) AS total');
    const [countRows] = await db.execute(countQuery, params);
    const totalCount = countRows[0].total;

    // Pagination
    const safeLimit = Math.max(1, parseInt(pageSize) || 10);
    const safeOffset = Math.max(0, (parseInt(page) - 1) * safeLimit || 0);
    query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const [rows] = await db.execute(query, params);

    // Count assigned/unassigned from current results
    const assignedCount = rows.filter(r => r.assigned_to).length;
    const unassignedCount = rows.filter(r => !r.assigned_to && r.status === 'New').length;

    res.json({
      contacts: rows,
      totalCount,
      assignedCount,
      unassignedCount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/contacts/:id', async (req, res) => {
  const db = getDB();
  try {
    const [rows] = await db.execute('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new contact
router.post('/contacts/batch', async (req, res) => {
  const db = getDB();
  console.log('Received POST /contacts/batch with body:', req.body);

  try {
    let contacts = req.body;

    // If the request is a single object, convert it into an array
    if (!Array.isArray(contacts)) {
      contacts = [contacts];
    }

    // Validate all contacts
    const invalidContacts = contacts.filter(contact => !contact.name);
    if (invalidContacts.length > 0) {
      return res.status(400).json({ 
        error: 'Name is required for all contacts',
        invalidContacts: invalidContacts.map((c, i) => ({ index: i, ...c }))
      });
    }

    // Start transaction
    await db.beginTransaction();
    const insertedContacts = [];

    try {
      for (const contact of contacts) {
        const { name, email, phone, leadOwner, author, publisher, bookTitle } = contact;

        const [result] = await db.execute(
          `INSERT INTO contacts 
          (name, email, phone, lead_owner, author, publisher, book_title) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [name, email, phone, leadOwner, author, publisher, bookTitle]
        );

        const [newContact] = await db.execute('SELECT * FROM contacts WHERE id = ?', [result.insertId]);
        insertedContacts.push(newContact[0]);
      }

      await db.commit();
      res.status(201).json(insertedContacts.length === 1 ? insertedContacts[0] : insertedContacts);
    } catch (err) {
      await db.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error in POST /contacts/batch:', err);
    res.status(500).json({ error: err.message });
  }
});
// router.post('/contacts/batch', async (req, res) => {
//   const db = getDB();
//   console.log('Received POST /contacts with body:', req.body);
  
//   try {
//     const { name, email, phone, leadOwner, author, publisher, bookTitle } = req.body;
    
//     console.log('Extracted fields:', { name, email, phone, leadOwner, author, publisher, bookTitle });
    
//     if (!name) {
//       console.log('Validation failed: Name is required');
//       return res.status(400).json({ error: 'Name is required' });
//     }

//     const [result] = await db.execute(
//       `INSERT INTO contacts 
//       (name, email, phone, lead_owner, author, publisher, book_title) 
//       VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [name, email, phone, leadOwner, author, publisher, bookTitle]
//     );
    
//     console.log('Insert result:', result);

//     const [newContact] = await db.execute('SELECT * FROM contacts WHERE id = ?', [result.insertId]);
//     console.log('New contact created:', newContact[0]);
    
//     res.status(201).json(newContact[0]);
//   } catch (err) {
//     console.error('Error in POST /contacts:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// Update contact
router.put('/contacts/:id', async (req, res) => {
    const db = getDB();
    try {
      console.log('Received PUT /contacts/:id with body:', req.body);
      
      // Destructure with default values for optional fields
      const { 
        name,
        email = null,
        phone = null,
        leadOwner = null,
        author = null,
        publisher = null,
        bookTitle = null,
        assignedTo = null
      } = req.body;
  
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
  
      const [result] = await db.execute(
        `UPDATE contacts SET 
        name = ?, 
        email = ?, 
        phone = ?, 
        lead_owner = ?, 
        author = ?, 
        publisher = ?, 
        book_title = ?, 
        assigned_to = COALESCE(?, assigned_to),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          name,
          email,
          phone,
          leadOwner,
          author,
          publisher,
          bookTitle,
          assignedTo,
          req.params.id
        ]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Contact not found' });
      }
  
      // Return the full updated contact
      const [updatedContact] = await db.execute(`
        SELECT 
          id,
          name,
          email,
          phone,
          lead_owner as leadOwner,
          author,
          publisher,
          book_title as bookTitle,
          status,
          assigned_to as assignedTo,
          created_at as createdAt,
          updated_at as updatedAt
        FROM contacts 
        WHERE id = ?`, 
        [req.params.id]
      );
      
      res.json(updatedContact[0]);
    } catch (err) {
      console.error('Error updating contact:', err);
      res.status(500).json({ 
        error: 'Failed to update contact',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  });

// Assign contact to agent
// router.post('/contacts/:id/assign', async (req, res) => {
//   const db = getDB();
//   try {
//     const { assignedTo } = req.body;
    
//     if (!assignedTo) {
//       return res.status(400).json({ error: 'Agent ID is required' });
//     }

//     const [result] = await db.execute(
//       'UPDATE contacts SET assigned_to = ? WHERE id = ?',
//       [assignedTo, req.params.id]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Contact not found' });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// Assign contact to agent
router.post('/contacts/:id/assign', async (req, res) => {
  const db = getDB();
  try {
    const { assignedTo } = req.body;
    console.log('Assigning contact:', req.params.id, 'to agent:', assignedTo);
    
    if (!assignedTo) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }

     // Get agent name
     const [agentRows] = await db.execute('SELECT name FROM users WHERE id = ?', [assignedTo]);
     if (agentRows.length === 0) {
       return res.status(404).json({ error: 'Assigned agent not found' });
     }
 
     const agentName = agentRows[0].name;
 
     const [result] = await db.execute(
       'UPDATE contacts SET assigned_to = ?, lead_owner = ? WHERE id = ?',
       [assignedTo, agentName, req.params.id]
     );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk assign contacts
// router.post('/contacts/bulk-assign', async (req, res) => {
//   const db = getDB();
//   try {
//     const { contactIds, assignedTo } = req.body;
    
//     if (!contactIds || !contactIds.length || !assignedTo) {
//       return res.status(400).json({ error: 'Contact IDs and Agent ID are required' });
//     }

//     const idPlaceholders = contactIds.map(() => '?').join(',');
    
//     const [result] = await db.execute(
//       `UPDATE contacts SET assigned_to = ? 
//       WHERE id IN (${idPlaceholders})`,
//       [assignedTo, ...contactIds]
//     );

//     res.json({ success: true, updatedCount: result.affectedRows });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// Bulk assign contacts
// router.post('/contacts/bulk-assign', async (req, res) => {
//   const db = getDB();
//   try {
//     const { contactIds, assignedTo } = req.body;
//     console.log(contactIds, assignedTo);
    
//     if (!contactIds || !contactIds.length || !assignedTo) {
//       return res.status(400).json({ error: 'Contact IDs and Agent ID are required' });
//     }

//     // Get agent name
//     const [agentRows] = await db.execute('SELECT name FROM users WHERE id = ?', [assignedTo]);
//     if (agentRows.length === 0) {
//       return res.status(404).json({ error: 'Assigned agent not found' });
//     }

//     const agentName = agentRows[0].name;

//     const idPlaceholders = contactIds.map(() => '?').join(',');
//     const values = [assignedTo, agentName, ...contactIds];

//     const [result] = await db.execute(
//       `UPDATE contacts SET assigned_to = ?, lead_owner = ? 
//        WHERE id IN (${idPlaceholders})`,
//       values
//     );

//     res.json({ success: true, updatedCount: result.affectedRows });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// Delete contact
// router.delete('/contacts/:id', async (req, res) => {
//     const db = getDB();
//     try {
//       console.log(`Attempting to delete contact with ID: ${req.params.id}`);
      
//       // First check if contact exists
//       const [contact] = await db.execute(
//         'SELECT id FROM contacts WHERE id = ?', 
//         [req.params.id]
//       );
  
//       if (contact.length === 0) {
//         return res.status(404).json({ error: 'Contact not found' });
//       }
  
//       // Delete the contact
//       const [result] = await db.execute(
//         'DELETE FROM contacts WHERE id = ?',
//         [req.params.id]
//       );
  
//       if (result.affectedRows === 0) {
//         return res.status(500).json({ error: 'Failed to delete contact' });
//       }
  
//       res.json({ 
//         success: true,
//         message: 'Contact deleted successfully',
//         deletedId: req.params.id
//       });
  
//     } catch (err) {
//       console.error('Error deleting contact:', err);
//       res.status(500).json({ 
//         error: 'Internal server error',
//         details: process.env.NODE_ENV === 'development' ? err.message : undefined
//       });
//     }
//   });

  router.delete('/contacts/bulk-delete', async (req, res) => {
    const db = getDB();
    const { contactIds } = req.body;
  
    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ error: 'No contact IDs provided.' });
    }
  
    try {
      const placeholders = contactIds.map(() => '?').join(', ');
      const sql = `DELETE FROM contacts WHERE id IN (${placeholders})`;
      const [result] = await db.execute(sql, contactIds);
  
      res.json({
        success: true,
        message: `${result.affectedRows} contact(s) deleted successfully.`,
        deletedIds: contactIds,
      });
    } catch (error) {
      console.error('Error deleting contacts:', error);
      res.status(500).json({ error: 'Failed to delete contacts.' });
    }
  });

  router.post('/transfer', async (req, res) => {
    const db = getDB();
    const { leadId, newAgentId } = req.body;
  
    if (!leadId || !newAgentId) {
      return res.status(400).json({ error: 'Lead ID and new Agent ID are required' });
    }
  
    try {
      // Get agent email
      const [agent] = await db.query('SELECT email FROM users WHERE id = ?', [newAgentId]);
      if (!agent || agent.length === 0) {
        return res.status(404).json({ error: 'Agent not found' });
      }
  
      const transferredToEmail = agent[0].email;
  
      // Update the contact record
      await db.query(`
        UPDATE contacts 
        SET transferred_to = ?, transferred_to_gmail = ?, transferred_at = NOW(), status = 'Transferred', rating = 'Flagged'
        WHERE id = ?
      `, [newAgentId, transferredToEmail, leadId]);
  
      res.status(200).json({ message: 'Lead transferred successfully' });
    } catch (err) {
      console.error('Transfer Error:', err);
      res.status(500).json({ error: 'Failed to transfer lead' });
    }
  });

// ======================
// USERS ENDPOINTS
// ======================

// Get all users (agents)
router.get('/users', async (req, res) => {
  const db = getDB();
  try {
    const [rows] = await db.execute('SELECT id, name, email, role FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/agents', async (req, res) => {
  const db = getDB();
  try {
    // Only select users with role 'agent' and active status (if you have such field)
    const [rows] = await db.execute(
      'SELECT id, name, email FROM users WHERE role = ? AND status = "Active" ORDER BY name ASC',
      ['agent']  // Only get users with agent role
    );
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// In your backend routes

// router.post('/clear-leads', async (req, res) => {
//   const db = getDB();
//   const { agentId } = req.body;

//   try {
//     // First, get the IDs of leads to be cleared (excluding Flagged)
//     const [rows] = await db.execute(
//       `SELECT id FROM contacts 
//        WHERE assigned_to = ? AND (rating IS NULL OR rating != 'Flagged')`,
//       [agentId]
//     );

//     const leadIds = rows.map(row => row.id);
//     if (leadIds.length === 0) {
//       return res.json({ success: true, affectedRows: 0 });
//     }

//     // Mark removed_at in history
//     const placeholders = leadIds.map(() => '?').join(',');
//     await db.execute(
//       `UPDATE assignment_history 
//        SET removed_at = NOW() 
//        WHERE agent_id = ? AND lead_id IN (${placeholders})`,
//       [agentId, ...leadIds]
//     );

//     // Clear the leads
//     const [result] = await db.execute(
//       `UPDATE contacts 
//        SET lead_owner = NULL, 
//            assigned_to = NULL, 
//            transferred_to = NULL,
//            transferred_at = NULL,
//            status = 'new', 
//            rating = NULL
//        WHERE assigned_to = ? AND (rating IS NULL OR rating != 'Flagged')`,
//       [agentId]
//     );

//     res.json({ success: true, affectedRows: result.affectedRows });
//   } catch (err) {
//     console.error('Error clearing leads:', err);
//     res.status(500).json({ error: 'Failed to clear leads' });
//   }
// });

router.post('/clear-leads', async (req, res) => {
  const db = getDB();
  const { agentId } = req.body;

  try {
    // Get leads assigned to this agent (excluding Flagged)
    const [rows] = await db.execute(
      `SELECT id FROM contacts 
       WHERE assigned_to = ? AND (rating IS NULL OR rating != 'Flagged')`,
      [agentId]
    );

    const leadIds = rows.map(row => row.id);
    
    if (leadIds.length === 0) {
      return res.json({ 
        success: true, 
        affectedRows: 0,
        message: 'No leads to clear for this agent'
      });
    }

    const placeholders = leadIds.map(() => '?').join(',');
    
    // Update assignment_history - mark when removed
    await db.execute(
      `UPDATE assignment_history 
       SET removed_at = NOW() 
       WHERE agent_id = ? AND lead_id IN (${placeholders}) AND removed_at IS NULL`,
      [agentId, ...leadIds]
    );
    
    // Clear leads - status stays as 'Contacted' (not 'New')
    await db.execute(
      `UPDATE contacts 
       SET lead_owner = NULL, 
           assigned_to = NULL,
           transferred_to = NULL,
           transferred_at = NULL,
           rating = NULL
       WHERE id IN (${placeholders})`,
      leadIds
    );

    res.json({ 
      success: true, 
      affectedRows: leadIds.length,
      message: `Cleared ${leadIds.length} leads. Leads remain as 'Contacted' with cooling period.`
    });
    
  } catch (err) {
    console.error('Error clearing leads:', err);
    res.status(500).json({ error: 'Failed to clear leads' });
  }
});

router.post('/register', async (req, res) => {
  const db = getDB();
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['admin', 'agent'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified. Must be either "admin" or "agent"' });
    }

    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );

    const [newUser] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser[0]
    });

  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  const db = getDB();
  console.log('\n=== NEW LOGIN ATTEMPT ===');
  console.log('Request received at:', new Date().toISOString());
  console.log('Email:', req.body.email);

  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      console.log('Validation failed - missing credentials');
      return res.status(400).json({ 
        error: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if email is valid format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('Querying database...');
    const [users] = await db.execute(
      'SELECT id, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Compare plain password
    if (user.password !== password) {
      console.log('Wrong password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session data
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.email = user.email;
    req.session.lastActivity = new Date();

    // Save session and update last_login
    req.session.save(async (err) => {
  if (err) {
    console.error('❌ Session save error:', err);
    return res.status(500).json({ error: 'Session error' });
  }

  console.log('✅ Session saved successfully:', req.session);

  try {
    await db.execute('UPDATE users SET last_login = ? WHERE id = ?', [new Date(), user.id]);
  } catch (updateErr) {
    console.error('❌ Error updating last_login:', updateErr);
  }

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});


  } catch (err) {
    console.error('SERVER ERROR:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      error: 'Server error during login',
      timestamp: new Date().toISOString()
    });
  }
});

// In activity middleware (updates on all requests)
router.use(async (req, res, next) => {
    const db = getDB();

  if (req.session.userId) {
    await db.execute(
      'UPDATE users SET last_activity = NOW() WHERE id = ?',
      [req.session.userId]
    );
  }
  next();
});


router.get('/check-session', async (req, res) => {  // Added /api prefix
  if (req.session.userId) {
    return res.json({
      loggedIn: true,
      user: {
        id: req.session.userId,
        email: req.session.email,
        role: req.session.role
      }
    });
  }
  res.json({ loggedIn: false });
});


router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    // Clear the session cookie
    res.clearCookie('session_cookie_name');
    res.json({ message: 'Logout successful' });
  });
});

// ======================
// STATS ENDPOINTS
// ======================

// Get contact statistics
router.get('/stats', async (req, res) => {
  const db = getDB();
  try {
    const [total] = await db.execute('SELECT COUNT(*) as count FROM contacts');
    const [assigned] = await db.execute('SELECT COUNT(*) as count FROM contacts WHERE assigned_to IS NOT NULL');
    const [unassigned] = await db.execute('SELECT COUNT(*) as count FROM contacts WHERE assigned_to IS NULL');
    
    res.json({
      total: total[0].count,
      assigned: assigned[0].count,
      unassigned: unassigned[0].count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// router.post('/contacts/bulk-assign', async (req, res) => {
//   const db = getDB();
//   try {
//     console.log('Bulk assign request received:', req.body);
//     const { contactIds, assignedTo } = req.body;
    
//     if (!contactIds || !contactIds.length || !assignedTo) {
//       console.log('Missing parameters');
//       return res.status(400).json({ error: 'Contact IDs and Agent ID are required' });
//     }

//     // STEP 0: Get agent name
//     console.log('Getting agent info for ID:', assignedTo);
//     const [agentRows] = await db.execute('SELECT name FROM users WHERE id = ?', [assignedTo]);
//     if (agentRows.length === 0) {
//       console.log('Agent not found:', assignedTo);
//       return res.status(404).json({ error: 'Assigned agent not found' });
//     }
//     const agentName = agentRows[0].name;
//     console.log('Agent found:', agentName);

//     // STEP 1: Filter out leads already assigned to this agent
//     console.log('Checking assignment history for', contactIds.length, 'contacts');
//     const idPlaceholders = contactIds.map(() => '?').join(',');
//     const [historyRows] = await db.execute(
//       `SELECT lead_id FROM assignment_history 
//        WHERE agent_id = ? AND lead_id IN (${idPlaceholders})`,
//       [assignedTo, ...contactIds]
//     );

//     const alreadyAssignedIds = historyRows.map(row => Number(row.lead_id));
//     console.log('Already assigned IDs:', alreadyAssignedIds);
    
//     const filteredContactIds = contactIds.map(Number).filter(id => !alreadyAssignedIds.includes(id));
//     console.log('Filtered contact IDs to assign:', filteredContactIds);

//     if (filteredContactIds.length === 0) {
//       console.log('All contacts already assigned');
//       return res.status(200).json({
//         success: false,
//         message: `All ${contactIds.length} selected leads were already assigned to this agent.`,
//         updatedCount: 0,
//         skipped: contactIds.length
//       });
//     }

//     // STEP 2: Assign leads in contacts table
//     console.log('Updating contacts table');
//     const filteredPlaceholders = filteredContactIds.map(() => '?').join(',');
//     const values = [assignedTo, agentName, ...filteredContactIds];
//     const [updateResult] = await db.execute(
//       `UPDATE contacts 
//        SET assigned_to = ?, lead_owner = ? 
//        WHERE id IN (${filteredPlaceholders})`,
//       values
//     );
//     console.log('Contacts updated:', updateResult.affectedRows);

//     // STEP 3: Insert new records into assignment_history
//     console.log('Inserting into assignment_history');
//     try {
//       const historyValues = filteredContactIds.map(id => [
//         parseInt(id), parseInt(assignedTo)
//       ]);

//       if (historyValues.length > 0) {
//         const placeholders = historyValues.map(() => '(?, ?)').join(',');
//         const flatValues = historyValues.flat();

//         const [result] = await db.execute(
//           `INSERT INTO assignment_history (lead_id, agent_id) VALUES ${placeholders}`,
//           flatValues
//         );

//         console.log('History insert success:', result.affectedRows, 'rows');
//       }
//     } catch (error) {
//       console.error('INSERT ERROR:', error.message);
//       // Don't throw here, just log
//     }

//     console.log('Sending success response');
//     res.json({
//       success: true,
//       updatedCount: updateResult.affectedRows,
//       skipped: alreadyAssignedIds.length,
//       message: `Successfully assigned ${updateResult.affectedRows} lead(s) to agent`
//     });

//   } catch (err) {
//     console.error('Error in /contacts/bulk-assign:', err.message, err.stack);
//     res.status(500).json({ error: err.message });
//   }
// });


// POST route to save bio data

router.post('/contacts/bulk-assign', async (req, res) => {
  const db = getDB();
  try {
    console.log('Bulk assign request received:', req.body);
    const { contactIds, assignedTo } = req.body;
    
    if (!contactIds || !contactIds.length || !assignedTo) {
      return res.status(400).json({ error: 'Contact IDs and Agent ID are required' });
    }

    // Get agent name
    const [agentRows] = await db.execute('SELECT name FROM users WHERE id = ?', [assignedTo]);
    if (agentRows.length === 0) {
      return res.status(404).json({ error: 'Assigned agent not found' });
    }
    const agentName = agentRows[0].name;

    const idPlaceholders = contactIds.map(() => '?').join(',');
    
    // 🔥 Only assign leads that have status = 'New'
    const [eligibleRows] = await db.execute(
      `SELECT id FROM contacts 
       WHERE id IN (${idPlaceholders}) 
       AND status = 'New'
       AND (rating IS NULL OR rating != 'Flagged')`,
      contactIds
    );
    
    const eligibleIds = eligibleRows.map(row => row.id);
    
    if (eligibleIds.length > 0) {
      const eligiblePlaceholders = eligibleIds.map(() => '?').join(',');
      const [existingAssignments] = await db.execute(
        `SELECT lead_id FROM assignment_history 
         WHERE agent_id = ? AND lead_id IN (${eligiblePlaceholders}) AND removed_at IS NULL`,
        [assignedTo, ...eligibleIds]
      );
      
      const alreadyAssignedIds = new Set(existingAssignments.map(row => row.lead_id));
      
      const assignableIds = eligibleIds.filter(id => !alreadyAssignedIds.has(Number(id)));
      const alreadyAssigned = eligibleIds.filter(id => alreadyAssignedIds.has(Number(id)));
      const nonNewIds = contactIds.filter(id => !eligibleRows.some(row => row.id === Number(id)));
      
      console.log('📊 Assignment breakdown:');
      console.log(`   Assignable (New leads): ${assignableIds.length}`);
      console.log(`   Already assigned: ${alreadyAssigned.length}`);
      console.log(`   Not assignable (Contacted/Other): ${nonNewIds.length}`);
      
      if (assignableIds.length === 0) {
        let message = '';
        if (nonNewIds.length > 0) {
          message = `${nonNewIds.length} lead(s) are already contacted and in cooling period. `;
        }
        if (alreadyAssigned.length > 0) {
          message += `${alreadyAssigned.length} lead(s) are already assigned to this agent.`;
        }
        return res.status(200).json({
          success: false,
          message: message || 'No assignable leads found.',
          updatedCount: 0,
          nonNewLeads: nonNewIds.length,
          alreadyAssigned: alreadyAssigned.length
        });
      }
      
      // 🔥 Assign leads - status becomes 'Contacted'
      const assignablePlaceholders = assignableIds.map(() => '?').join(',');
      const values = [assignedTo, agentName, ...assignableIds];
      const [updateResult] = await db.execute(
        `UPDATE contacts 
         SET assigned_to = ?, 
             lead_owner = ?,
             status = 'Contacted'
         WHERE id IN (${assignablePlaceholders})`,
        values
      );
      
      // 🔥 Insert into assignment_history - FIXED VERSION
      if (assignableIds.length > 0) {
        // Create placeholders for each lead: (?, ?)
        const historyPlaceholders = assignableIds.map(() => '(?, ?)').join(',');
        // Flatten the values: [lead_id1, agent_id, lead_id2, agent_id, ...]
        const historyValues = assignableIds.flatMap(id => [parseInt(id), parseInt(assignedTo)]);
        
        console.log('Inserting into assignment_history:', {
          count: assignableIds.length,
          placeholders: historyPlaceholders,
          values: historyValues
        });
        
        await db.execute(
          `INSERT INTO assignment_history (lead_id, agent_id) VALUES ${historyPlaceholders}`,
          historyValues
        );
      }
      
      res.json({
        success: true,
        updatedCount: updateResult.affectedRows,
        nonNewLeads: nonNewIds.length,
        alreadyAssigned: alreadyAssigned.length,
        message: `✅ Assigned ${updateResult.affectedRows} new lead(s) to ${agentName}. 
                  ${nonNewIds.length} lead(s) were already contacted and cannot be reassigned. 
                  ${alreadyAssigned.length} lead(s) already assigned to this agent.`
      });
      
    } else {
      res.json({
        success: false,
        updatedCount: 0,
        nonNewLeads: contactIds.length,
        message: `No new leads found. ${contactIds.length} lead(s) are already contacted and in cooling period.`
      });
    }
    
  } catch (err) {
    console.error('Error in /contacts/bulk-assign:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Optional: Move contacted leads back to New after cooling period
router.post('/refresh-cooling-period', async (req, res) => {
  const db = getDB();
  const { days = 7 } = req.body; // Default 7 days cooling period
  
  try {
    // Find leads that were cleared more than X days ago
    const [expiredLeads] = await db.execute(
      `SELECT DISTINCT c.id 
       FROM contacts c
       JOIN assignment_history ah ON c.id = ah.lead_id
       WHERE c.status = 'Contacted'
       AND c.assigned_to IS NULL
       AND ah.removed_at IS NOT NULL
       AND ah.removed_at < DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY c.id`,
      [days]
    );
    
    if (expiredLeads.length > 0) {
      const leadIds = expiredLeads.map(row => row.id);
      const placeholders = leadIds.map(() => '?').join(',');
      
      await db.execute(
        `UPDATE contacts 
         SET status = 'New'
         WHERE id IN (${placeholders})`,
        leadIds
      );
      
      res.json({
        success: true,
        refreshedCount: leadIds.length,
        message: `Moved ${leadIds.length} leads from Contacted back to New after ${days} days cooling period.`
      });
    } else {
      res.json({
        success: true,
        refreshedCount: 0,
        message: `No leads have exceeded ${days} days cooling period.`
      });
    }
  } catch (err) {
    console.error('Error refreshing cooling period:', err);
    res.status(500).json({ error: 'Failed to refresh cooling period' });
  }
});

router.post('/leads/:id/bio', async (req, res) => {
  const db = getDB();
  const leadId = req.params.id;
  const {
    name,
    book_titles_input,
    email,
    street_address,
    city,
    state,
    zipcode,
    phone_numbers_input,
    reserve_note,
    additional_notes
  } = req.body;

  console.log('Received bio data for lead ID:', leadId);
  console.log('Book titles input:', book_titles_input);
  console.log('Phone numbers input:', phone_numbers_input);

  if (!leadId) {
    return res.status(400).json({ message: 'Lead ID is required' });
  }

  try {
    // Process book titles - split by comma and clean up
    const bookTitlesArray = book_titles_input
      ? book_titles_input.split(',').map(title => title.trim()).filter(title => title)
      : [];
    const bookTitle = bookTitlesArray.join(', ');

    // Process phone numbers - split by comma and clean up
    const phoneNumbersArray = phone_numbers_input
      ? phone_numbers_input.split(',').map(phone => phone.trim()).filter(phone => phone)
      : [];
    const phone = JSON.stringify(phoneNumbersArray);

    // Build the SQL query dynamically based on provided fields
    let updateFields = [];
    let updateValues = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    
    if (book_titles_input !== undefined) {
      updateFields.push('book_title = ?');
      updateValues.push(bookTitle);
    }
    
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (street_address !== undefined) {
      updateFields.push('street_address = ?');
      updateValues.push(street_address);
    }
    
    if (city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(city);
    }
    
    if (state !== undefined) {
      updateFields.push('state = ?');
      updateValues.push(state);
    }
    
    if (zipcode !== undefined) {
      updateFields.push('zipcode = ?');
      updateValues.push(zipcode);
    }
    
    if (phone_numbers_input !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    
    if (reserve_note !== undefined) {
      updateFields.push('reserve_note = ?');
      updateValues.push(reserve_note);
    }
    
    if (additional_notes !== undefined) {
      updateFields.push('comment = ?');
      updateValues.push(additional_notes);
    }
    
    // Add updated_at timestamp
    updateFields.push('updated_at = NOW()');
    
    // Add lead ID to values
    updateValues.push(leadId);
    
    if (updateFields.length === 1) { // Only updated_at field
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    const sql = `UPDATE contacts SET ${updateFields.join(', ')} WHERE id = ?`;
    
    console.log('Executing SQL:', sql);
    console.log('With values:', updateValues);
    
    const [result] = await db.execute(sql, updateValues);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Get the updated lead
    const [updatedLead] = await db.execute(
      'SELECT * FROM contacts WHERE id = ?',
      [leadId]
    );

    res.status(200).json({ 
      message: 'Bio data updated successfully',
      data: updatedLead[0]
    });

  } catch (error) {
    console.error('Error updating bio data:', error);
    res.status(500).json({ 
      message: 'Failed to update bio data',
      error: error.message 
    });
  }
});

// GET route to fetch bio data
router.get('/leads/:id/bio', async (req, res) => {
  const db = getDB();
  const leadId = req.params.id;

  if (!leadId) {
    return res.status(400).json({ message: 'Lead ID is required' });
  }

  try {
    const [result] = await db.execute(
      'SELECT * FROM contacts WHERE id = ?',
      [leadId]
    );
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = result[0];
    
    // Parse phone numbers if they exist
    let phone_numbers = [];
    if (lead.phone) {
      try {
        phone_numbers = JSON.parse(lead.phone);
        if (!Array.isArray(phone_numbers)) {
          phone_numbers = [lead.phone];
        }
      } catch {
        phone_numbers = [lead.phone];
      }
    }
    
    // Parse book titles
    let book_titles = [];
    if (lead.book_title) {
      book_titles = lead.book_title.split(',').map(title => title.trim()).filter(title => title);
    }

    const bioData = {
      contact_id: lead.id,
      name: lead.name || '',
      book_titles: book_titles,
      book_titles_input: lead.book_title || '',
      email: lead.email || '',
      street_address: lead.street_address || '',
      city: lead.city || '',
      state: lead.state || '',
      zipcode: lead.zipcode || '',
      phone_numbers: phone_numbers,
      phone_numbers_input: phone_numbers.join(', ') || '',
      reserve_note: lead.reserve_note || '',
      additional_notes: lead.comment || ''
    };

    res.status(200).json(bioData);

  } catch (error) {
    console.error('Error fetching bio data:', error);
    res.status(500).json({ 
      message: 'Failed to fetch bio data',
      error: error.message 
    });
  }
});

// router.get('/contacts-agents', async (req, res) => {
//   const db = getDB();

//   try {
//     const agentId = req.session.userId;
//     if (!agentId) return res.status(401).json({ error: 'Unauthorized' });

//     const page = parseInt(req.query.page) || 1;
//     const pageSize = parseInt(req.query.pageSize) || 10;
//     const offset = (page - 1) * pageSize;
//     const search = (req.query.search || '').trim().toLowerCase();
//     const filter = req.query.filter || 'all';

//     let baseQuery = `
//       SELECT * FROM contacts
//       WHERE (assigned_to = ? OR transferred_to = ?)
//     `;
//     let countQuery = `
//       SELECT COUNT(*) as total FROM contacts
//       WHERE (assigned_to = ? OR transferred_to = ?)
//     `;
//     let baseParams = [agentId, agentId];
//     let countParams = [agentId, agentId];

//     // Add search condition
//     if (search) {
//       // Normalize input if digits (for phone search)
//       const normalizedSearch = search.replace(/[\s()+\-.]/g, '');
//       const likeSearch = `%${search}%`;

//       const conditions = [
//         `LOWER(name) LIKE ?`,
//         `LOWER(email) LIKE ?`,
//         `LOWER(book_title) LIKE ?`
//       ];
//       const searchParams = [likeSearch, likeSearch, likeSearch];

//       // If digits, add phone number condition
//       if (/^\d+$/.test(normalizedSearch)) {
//         conditions.splice(2, 0, `
//           REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', ''), ' ', ''), '+', ''), '.', '') LIKE ?
//         `);
//         searchParams.splice(2, 0, `%${normalizedSearch}%`);
//       }

//       const searchCondition = `AND (${conditions.join(' OR ')})`;
//       baseQuery += `\n${searchCondition}`;
//       countQuery += `\n${searchCondition}`;

//       baseParams.push(...searchParams);
//       countParams.push(...searchParams);
//     }

//     // Add filter condition
//     let filterCondition = '';
//     if (filter === 'flagged') {
//       filterCondition = ` AND rating = 'Flagged'`;
//     } else if (filter === 'incomplete') {
//       filterCondition = ` AND payment_status = 'incomplete'`;
//     } else {
//       filterCondition = `
//         AND (payment_status IS NULL OR payment_status NOT IN ('incomplete', 'completed'))
//         AND (rating IS NULL OR rating != 'Flagged')
//       `;
//     }

//     baseQuery += filterCondition;
//     countQuery += filterCondition;

//     // Add pagination (note: not using params for LIMIT/OFFSET to avoid escaping issues)
//     baseQuery += ` LIMIT ${pageSize} OFFSET ${offset}`;

//     // Execute queries
//     const [results] = await db.execute(baseQuery, baseParams);
//     const [countResult] = await db.execute(countQuery, countParams);
//     const totalItems = countResult[0].total;

//     res.json({
//       data: results,
//       pagination: {
//         totalItems,
//         totalPages: Math.ceil(totalItems / pageSize),
//         currentPage: page,
//         pageSize
//       }
//     });

//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Failed to fetch contacts' });
//   }
// });

router.get('/contacts-agents', async (req, res) => {
  const db = getDB();

  try {
    const agentId = req.session.userId;
    if (!agentId) return res.status(401).json({ error: 'Unauthorized' });

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const search = (req.query.search || '').trim().toLowerCase();
    const filter = req.query.filter || 'all';

    let baseQuery = `
      SELECT * FROM contacts
      WHERE (assigned_to = ? OR transferred_to = ?)
    `;
    let countQuery = `
      SELECT COUNT(*) as total FROM contacts
      WHERE (assigned_to = ? OR transferred_to = ?)
    `;
    let baseParams = [agentId, agentId];
    let countParams = [agentId, agentId];

    // Add search condition
    if (search) {
      const normalizedSearch = search.replace(/[\s()+\-.]/g, '');
      const likeSearch = `%${search}%`;

      const conditions = [
        `LOWER(name) LIKE ?`,
        `LOWER(email) LIKE ?`,
        `LOWER(book_title) LIKE ?`
      ];
      const searchParams = [likeSearch, likeSearch, likeSearch];

      if (/^\d+$/.test(normalizedSearch)) {
        conditions.splice(2, 0, `
          REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', ''), ' ', ''), '+', ''), '.', '') LIKE ?
        `);
        searchParams.splice(2, 0, `%${normalizedSearch}%`);
      }

      const searchCondition = `AND (${conditions.join(' OR ')})`;
      baseQuery += `\n${searchCondition}`;
      countQuery += `\n${searchCondition}`;

      baseParams.push(...searchParams);
      countParams.push(...searchParams);
    }

    // Add filter condition
    let filterCondition = '';
    if (filter === 'flagged') {
      filterCondition = ` AND rating = 'Flagged'`;
    } else if (filter === 'incomplete') {
      filterCondition = ` AND payment_status = 'incomplete'`;
    } else {
      filterCondition = `
        AND (payment_status IS NULL OR payment_status NOT IN ('incomplete', 'completed'))
        AND (rating IS NULL OR rating != 'Flagged')
      `;
    }

    baseQuery += filterCondition;
    countQuery += filterCondition;

    // 🔥 FIX: Add ORDER BY id DESC to show newest first for agents
    baseQuery += ` ORDER BY id DESC LIMIT ${pageSize} OFFSET ${offset}`;

    // Execute queries
    const [results] = await db.execute(baseQuery, baseParams);
    const [countResult] = await db.execute(countQuery, countParams);
    const totalItems = countResult[0].total;

    res.json({
      data: results,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        pageSize
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});
router.post('/contacts/:id/status', async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (status === 'Completed') {
      await db.execute(
        `UPDATE contacts SET status = ?, payment_status = ?, rating = ? WHERE id = ?`,
        ['Completed', 'Completed','Flagged', id]
      );
    } else {
      await db.execute(
        `UPDATE contacts SET status = ? WHERE id = ?`,
        [status, id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/leads/:id/comment', async (req, res) => {
  const db = getDB();
  
  const leadId = req.params.id;
  const { comment } = req.body;

  console.log('Received leadId:', leadId);

  if (!leadId || !comment) {
    return res.status(400).json({ message: 'Lead ID and comment are required' });
  }

  try {
    const sql = 'UPDATE contacts SET comment = ? WHERE id = ?';
    
    // Use execute instead of query (keeping consistency with your other route)
    const [result] = await db.execute(sql, [comment, leadId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json({ message: 'Comment updated successfully' });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/leads/:id/comment', async (req, res) => {
  const db = getDB();
  
  const leadId = req.params.id;
  const { comment } = req.body;

  console.log('Received leadId:', leadId);

  if (!leadId || !comment) {
    return res.status(400).json({ message: 'Lead ID and comment are required' });
  }

  try {
    const sql = 'UPDATE contacts SET comment = ? WHERE id = ?';
    
    // Use execute instead of query (keeping consistency with your other route)
    const [result] = await db.execute(sql, [comment, leadId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json({ message: 'Comment updated successfully' });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


router.put('/update-ratings/:id', async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { rating } = req.body;
  console.log('Received rating:', rating);

  try {
    // Validate input
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }

    // Validate rating value
    const validRatings = ['Flagged', 'Decline'];
    if (rating && !validRatings.includes(rating)) {
      return res.status(400).json({ 
        error: 'Invalid rating value',
        validValues: validRatings
      });
    }

    // Prepare update query based on rating
    let query, params;
    
    if (rating === 'Decline') {
      // If declining, nullify transfer fields
      query = `
        UPDATE contacts 
        SET rating = NULL, 
            rating_updated_at = NOW(),
            assigned_to = NULL,
            transferred_to = NULL,
            transferred_at = NULL,
            transferred_to_gmail = NULL,
            lead_owner = NULL,
            status = 'New'
        WHERE id = ?`;
      params = [id];
    } else {
      // For other ratings (Flagged), just update rating
      query = `
        UPDATE contacts 
        SET rating = ?, 
            rating_updated_at = NOW(),
            status = 'Contacted'
        WHERE id = ?`;
      params = [rating, id];
    }

    // Execute the update
    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Get the updated contact
    const [updatedContacts] = await db.execute(
      'SELECT * FROM contacts WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Rating updated successfully',
      data: updatedContacts[0]
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Failed to update rating',
      details: error.message
    });
  }
});

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../backend/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post('/create-transaction', upload.single("file"), async (req, res) => {
  const db = getDB();
  const {
    lead_id,
    lead_name,
    lead_owner,
    trans_status,
    service_name,
    amount_pay,
    payment_status,
    tot_service_price,
    remain_bal,
    lead_transferredTo
  } = req.body;

  try {
    // Validate required fields
    if (!lead_id || isNaN(lead_id)) {
      return res.status(400).json({ error: 'Invalid lead ID' });
    }

    // Check existing transactions
    const [existingPayments] = await db.execute(
      `SELECT * FROM service_transactions 
       WHERE transaction_id = ? 
       ORDER BY transaction_date DESC`,
      [lead_id]
    );

    const isFirstPayment = existingPayments.length === 0;
    const isSecondPayment = !isFirstPayment && 
                          existingPayments[0].payment_status === 'First Payment';

    // Validate payment sequence
    if (payment_status === 'Second Payment' && !isSecondPayment) {
      return res.status(400).json({ 
        error: 'Cannot make second payment without first payment',
        required: 'First Payment must be completed first'
      });
    }

    if (payment_status === 'First Payment' && !isFirstPayment) {
      return res.status(400).json({ 
        error: 'First payment already exists',
        existingPayment: existingPayments[0]
      });
    }

    // Calculate remaining balance
    let actualRemaining = parseFloat(remain_bal);
    if (!isFirstPayment) {
      const previousRemaining = parseFloat(existingPayments[0].remain_bal);
      actualRemaining = previousRemaining - parseFloat(amount_pay);
      
      if (actualRemaining < 0) {
        return res.status(400).json({ 
          error: 'Payment exceeds remaining balance',
          maxAllowed: previousRemaining
        });
      }
    }

    // Determine transaction status based on payment status
    let transactionStatus;
    if (payment_status === 'First Payment') {
      transactionStatus = 'Incomplete';
    } else if (payment_status === 'Second Payment') {
      transactionStatus = 'Completed';
    } else if (payment_status === 'Full Payment') {
      transactionStatus = 'Completed';
    }

    // Convert service_name to string
    const servicesString = Array.isArray(service_name) 
      ? service_name.join(',') 
      : service_name;

    // Handle file upload
    let fileData = {
      filename: null,
      file_path: null,
      file_type: null
    };

    if (req.file) {
      fileData = {
        filename: req.file.originalname,
        file_path: `/uploads/${req.file.filename}`,
        file_type: path.extname(req.file.originalname)
      };
    }

    // Start transaction
    await db.beginTransaction();

    try {
      // Insert transaction record with status
      const [transactionResult] = await db.execute(
        `INSERT INTO service_transactions (
          transaction_id,
          lead_name,
          lead_owner,
          trans_status,
          service_name,
          amount_pay,
          payment_status,
          tot_service_price,
          remain_bal,
          transaction_date,
          file_name,
          file_path,
          file_type,
          lead_transferredTo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
        [
          lead_id,
          lead_name,
          lead_owner,
          trans_status,
          servicesString,
          amount_pay,
          payment_status,
          tot_service_price,
          actualRemaining,
          fileData.filename,
          fileData.file_path,
          fileData.file_type,
          lead_transferredTo
        ]
      );

      if (payment_status === 'First Payment') {
        await db.execute(
          `UPDATE Contacts 
           SET status = 'In Progress',
           payment_status = 'Incomplete'
           WHERE id = ?`,
          [lead_id]
        );
      }
      if (payment_status === 'Second Payment' || payment_status === 'Full Payment') {
        await db.execute(
          `UPDATE Contacts 
           SET status = 'Completed',
           payment_status = 'Completed'
           WHERE id = ?`,
          [lead_id]
        );
      }
      // If this is a Second Payment, update previous First Payment record
      if (payment_status === 'Second Payment' || payment_status === 'Full Payment') {
        await db.execute(
          `UPDATE service_transactions 
           SET status = 'Completed'
           WHERE transaction_id = ?`,
          [lead_id]
        );
      }
      if (payment_status === 'First Payment') {
        await db.execute(
          `UPDATE service_transactions 
           SET status = 'Incomplete'
           WHERE transaction_id = ?`,
          [lead_id]
        );
      }

      await db.commit();

      res.json({
        success: true,
        message: 'Transaction processed successfully',
        transaction_id: transactionResult.insertId,
        status: transactionStatus,
        remaining_balance: actualRemaining,
        is_complete: transactionStatus === 'Completed'
      });

    } catch (error) {
      await db.rollback();
      console.error('Database error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Transaction processing error:', error);
    res.status(500).json({ 
      error: 'Transaction processing failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get('/transactions/:leadId', async (req, res) => {
  const db = getDB();
  const { leadId } = req.params;

  try {
    if (!leadId || isNaN(leadId)) {
      return res.status(400).json({ error: 'Invalid lead ID' });
    }

    const [transactions] = await db.execute(
      `SELECT 
        transID,
        transaction_id,
        trans_status,
        service_name,
        amount_pay,
        payment_status,
        tot_service_price,
        remain_bal,
        transaction_date,
        file_name,
        file_path,
        file_type,
        status
      FROM service_transactions
      WHERE transaction_id = ? 
      ORDER BY transaction_date DESC`,
      [leadId]
    );

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
  }
});

// Get fulfilled contacts
router.get('/contacts-fullfilled', async (req, res) => {
  const db = getDB();
  
  try {
    const agentId = req.session.userId;
    if (!agentId) return res.status(401).json({ error: 'Unauthorized' });

    const [results] = await db.execute(
      `SELECT * FROM contacts 
       WHERE (assigned_to = ? OR transferred_to = ?)
       AND LOWER(TRIM(status)) IN ('completed', 'in progress')`,
      [agentId, agentId]
    );
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Create new fulfillment contact
// router.post('/fulfilled-contacts', async (req, res) => {
//   const db = getDB();
  
//   try {
//     const {
//       name,
//       email,
//       phone,
//       author,
//       publisher,
//       book
//     } = req.body;

//     // Get the logged-in user's ID from the session
//     const userId = req.session.user?.id;
//     if (!userId) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }

//     // Insert new contact with Completed status and assigned_to
//     const [result] = await db.execute(
//       `INSERT INTO contacts 
//         (name, email, phone, author, publisher, book_title, status, payment_status, assigned_to)
//        VALUES (?, ?, ?, ?, ?, ?, 'Completed', 'Completed', ?)`,
//       [name, email, phone, author, publisher, book, userId]
//     );

//     // Fetch the newly created contact to get all fields
//     const [newContact] = await db.execute(
//       `SELECT * FROM contacts WHERE id = ?`,
//       [result.insertId]
//     );

//     res.json({
//       id: newContact[0].id,
//       name: newContact[0].name,
//       email: newContact[0].email,
//       phone: newContact[0].phone,
//       status: newContact[0].status,
//       book_title: newContact[0].book_title,
//       publisher: newContact[0].publisher,
//       assigned_to: newContact[0].assigned_to,
//       message: 'Fulfillment contact created successfully'
//     });
//   } catch (error) {
//     console.error('Error creating fulfillment contact:', error);
//     res.status(500).json({ error: 'Failed to create fulfillment contact' });
//   }
// });
router.post('/fulfilled-contacts', async (req, res) => {
  const db = getDB();
  
  try {
    const {
      name,
      email,
      phone,
      author,
      publisher,
      book,
      userId
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Insert new contact with Completed status and assigned_to
    const [result] = await db.execute(
      `INSERT INTO contacts 
        (name, email, phone, author, publisher, book_title, status, payment_status, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, 'Completed', 'Completed', ?)`,
      [name, email, phone, author, publisher, book, userId]
    );

    // Fetch the newly created contact to get all fields
    const [newContact] = await db.execute(
      `SELECT * FROM contacts WHERE id = ?`,
      [result.insertId]
    );

    res.json({
      id: newContact[0].id,
      name: newContact[0].name,
      email: newContact[0].email,
      phone: newContact[0].phone,
      status: newContact[0].status,
      book_title: newContact[0].book_title,
      publisher: newContact[0].publisher,
      assigned_to: newContact[0].assigned_to,
      message: 'Fulfillment contact created successfully'
    });
  } catch (error) {
    console.error('Error creating fulfillment contact:', error);
    res.status(500).json({ error: 'Failed to create fulfillment contact' });
  }
});

// Get transactions for a lead
router.get('/transactions/:leadId', async (req, res) => {
  const db = getDB();
  const { leadId } = req.params;

  try {
    if (!leadId || isNaN(leadId)) {
      return res.status(400).json({ error: 'Invalid lead ID' });
    }

    const [transactions] = await db.execute(
      `SELECT 
        transaction_id,
        trans_status,
        service_name,
        amount_pay,
        payment_status,
        tot_service_price,
        remain_bal,
        transaction_date,
        file_name,
        file_path,
        file_type
      FROM service_transactions
      WHERE transaction_id = ? 
      ORDER BY transaction_date DESC`,
      [leadId]
    );

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
  }
});

// Complete a transaction (Second Payment)
router.post('/complete-transaction/:transactionId', async (req, res) => {
  const db = getDB();
  const transactionId = req.params.transactionId;
  const {
    paymentAmount,
    paymentStatus,
    paymentDate,
    serviceName,
    status,
    filePath,
    fileName,
    fileType,
    totalPrice,
    
  } = req.body;

  console.log(req.body);
  remainingBalance = 0;

  try {
    // Insert the transaction record into service_transactions table
    const insertQuery = `
      INSERT INTO service_transactions (
        transaction_id,
        trans_status,
        service_name,
        amount_pay,
        payment_status,
        tot_service_price,
        remain_bal,
        transaction_date,
        file_name,
        file_path,
        file_type,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    if (paymentStatus === 'Second Payment') {
        await db.execute(
          `UPDATE service_transactions 
           SET status = 'Completed'
           WHERE transaction_id = ? 
           AND payment_status = 'First Payment'`,
          [transactionId]
        );
        await db.execute(
          `UPDATE contacts 
           SET status = 'Completed',
            payment_status = 'Completed'
           WHERE id = ?`,
          [transactionId]
        );
      }
    await db.execute(insertQuery, [
      transactionId,
      status,
      serviceName,
      paymentAmount,
      paymentStatus,
      totalPrice,
      remainingBalance,
      paymentDate,
      fileName,
      filePath,
      fileType,
      'Completed'
    ]);

    res.json({ message: 'Transaction completed and recorded successfully.' });
  } catch (error) {
    console.error('Error inserting completed transaction:', error);
    res.status(500).json({ error: 'Failed to complete and save transaction.' });
  }
});

router.get('/performance',  async (req, res) => {
  try {
    const db = getDB();
    
    const [agents] = await db.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(c.id) AS totalTasks,
        SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) AS tasksCompleted,
        COALESCE(
          (SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) / 
          NULLIF(COUNT(c.id), 0)) * 100, 0
        ) AS efficiency,
        MAX(c.updated_at) AS lastActive,
        (
          SELECT GROUP_CONCAT(c2.book_title SEPARATOR ', ')
          FROM contacts c2
          WHERE c2.assigned_to = u.id AND c2.status != 'completed'
          LIMIT 3
        ) AS currentTask,
        (
          SELECT c3.status
          FROM contacts c3
          WHERE c3.assigned_to = u.id
          ORDER BY c3.updated_at DESC
          LIMIT 1
        ) AS status
      FROM users u
      LEFT JOIN contacts c ON u.id = c.assigned_to
      WHERE u.role = 'agent'
      GROUP BY u.id
    `);
    
    const formattedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      totalTasks: agent.totalTasks,
      tasksCompleted: agent.tasksCompleted,
      efficiency: Math.round(agent.efficiency),
      lastActive: agent.lastActive,
      currentTask: agent.currentTask || 'No current tasks',
      status: agent.status || 'New' // Use exact status from DB or default to 'New'
    }));
    
    res.json(formattedAgents);
  } catch (error) {
    console.error('Error fetching agent performance:', error);
    res.status(500).json({ error: 'Failed to fetch agent performance data' });
  }
});

router.post('/agent-leads', async (req, res) => {
  try {
    const { agentIds, status, timeFilter, startDate, endDate } = req.body;
    
    // Validate input
    if (!agentIds || !Array.isArray(agentIds)) {
      return res.status(400).json({ error: 'Invalid agent IDs provided' });
    }

    const db = getDB();
    
    // Convert agentIds to integers for safety
    const agentIdNumbers = agentIds.map(id => parseInt(id));
    
    // Base query
    let query = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.book_title,
        c.publisher,
        c.status,
        c.comment,
        c.rating,
        c.created_at,
        c.updated_at,
        u.name AS agentName
      FROM contacts c
      JOIN users u ON c.assigned_to = u.id
      WHERE c.assigned_to IN (${agentIdNumbers.map(() => '?').join(',')})
    `;
    
    const params = [...agentIdNumbers];

    // Add status filter if provided
    if (status && status !== 'all') {
      query += ' AND c.status = ?';
      params.push(status);
    }

    // Add date filters
    if (timeFilter && timeFilter !== 'all') {
      let dateCondition = '';
      const now = new Date();
      
      switch (timeFilter) {
        case 'today':
          dateCondition = 'DATE(c.created_at) = CURDATE()';
          break;
        case 'week':
          dateCondition = 'YEARWEEK(c.created_at, 1) = YEARWEEK(CURDATE(), 1)';
          break;
        case 'month':
          dateCondition = 'YEAR(c.created_at) = YEAR(CURDATE()) AND MONTH(c.created_at) = MONTH(CURDATE())';
          break;
        case 'year':
          dateCondition = 'YEAR(c.created_at) = YEAR(CURDATE())';
          break;
      }
      
      if (dateCondition) {
        query += ` AND ${dateCondition}`;
      }
    } else if (startDate && endDate) {
      query += ' AND c.created_at BETWEEN ? AND ?';
      params.push(new Date(startDate), new Date(endDate));
    }

    query += ' ORDER BY c.created_at DESC';

    const [leads] = await db.execute(query, params);
    
    // Format the data for the frontend
    const formattedLeads = leads.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      book_title: lead.book_title,
      publisher: lead.publisher,
      status: lead.status,
      comment: lead.comment,
      rating: lead.rating,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      agentName: lead.agentName
    }));
    
    res.json(formattedLeads);
  } catch (error) {
    console.error('Error fetching agent leads:', error);
    res.status(500).json({ error: 'Failed to fetch agent leads data' });
  }
});

router.post('/agent-transactions', async (req, res) => {
  try {
    const { agentIds, timeFilter, startDate, endDate } = req.body;
    
    // Validate input
    if (!agentIds || !Array.isArray(agentIds)) {
      return res.status(400).json({ error: 'Invalid agent IDs provided' });
    }

    const db = getDB();
    
    // Convert agentIds to integers for safety
    const agentIdNumbers = agentIds.map(id => parseInt(id));
    
    // Base query
    let query = `
      SELECT 
        t.transaction_id,
        t.trans_status,
        t.service_name,
        t.amount_pay,
        t.payment_status,
        t.tot_service_price,
        t.remain_bal,
        t.status,
        t.transaction_date,
        t.file_name,
        t.file_path,
        t.file_type,
        u.name AS agentName
      FROM service_transactions t
      JOIN contacts u ON t.transaction_id = u.id
      WHERE t.transaction_id IN (${agentIdNumbers.map(() => '?').join(',')})
    `;
    
    const params = [...agentIdNumbers];

    // Add date filters
    if (timeFilter && timeFilter !== 'all') {
      let dateCondition = '';
      const now = new Date();
      
      switch (timeFilter) {
        case 'today':
          dateCondition = 'DATE(t.transaction_date) = CURDATE()';
          break;
        case 'week':
          dateCondition = 'YEARWEEK(t.transaction_date, 1) = YEARWEEK(CURDATE(), 1)';
          break;
        case 'month':
          dateCondition = 'YEAR(t.transaction_date) = YEAR(CURDATE()) AND MONTH(t.transaction_date) = MONTH(CURDATE())';
          break;
        case 'year':
          dateCondition = 'YEAR(t.transaction_date) = YEAR(CURDATE())';
          break;
      }
      
      if (dateCondition) {
        query += ` AND ${dateCondition}`;
      }
    } else if (startDate && endDate) {
      query += ' AND t.transaction_date BETWEEN ? AND ?';
      params.push(new Date(startDate), new Date(endDate));
    }

    query += ' ORDER BY t.transaction_date DESC';

    const [transactions] = await db.execute(query, params);
    
    // Format the data for the frontend
    const formattedTransactions = transactions.map(trans => ({
      transaction_id: trans.transaction_id,
      trans_status: trans.trans_status,
      service_name: trans.service_name,
      amount_pay: trans.amount_pay,
      payment_status: trans.payment_status,
      tot_service_price: trans.tot_service_price,
      remain_bal: trans.remain_bal,
      status: trans.status,
      transaction_date: trans.transaction_date,
      file_name: trans.file_name,
      file_path: trans.file_path,
      file_type: trans.file_type,
      agentName: trans.agentName
    }));
    
    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching agent transactions:', error);
    res.status(500).json({ error: 'Failed to fetch agent transactions data' });
  }
});



router.post('/bookstore', async (req, res) => {
  try {
    const db = getDB();
    const {
      transaction_id,
      bookstore,
      location,
      quantity,
      email,
      phone,
      owner,
      date,
      status,
      agent,
      state,
      zipcode
    } = req.body;

    if (!transaction_id || !bookstore) {
      return res.status(400).json({ error: 'Transaction ID and bookstore name are required' });
    }

    const [result] = await db.query(`
      INSERT INTO bookstore (
        transaction_id,
        bookstore,
        location,
        quantity,
        email,
        phone,
        owner,
        date,
        status,
        agent,
        state,
        zipcode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      transaction_id,
      bookstore,
      location,
      quantity,
      email,
      phone,
      owner,
      date,
      status,
      agent,
      state,
      zipcode
    ]);

    res.status(201).json({ 
      message: 'Bookstore entry saved', 
      insertId: result.insertId 
    });
  } catch (error) {
    console.error('Error saving bookstore entry:', error);
    res.status(500).json({ 
      error: 'Failed to save bookstore entry',
      details: error.message 
    });
  }
});


router.get('/get-bookstores', async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(`
      SELECT id,transaction_id, bookstore, location, quantity, email, phone, owner, date, status, agent, state, zipcode
      FROM bookstore
    `);
    res.json(rows);
  } catch (error) {  
    console.error('Error fetching bookstores:', error);
    res.status(500).json({ error: 'Failed to fetch bookstores' });
  }
});

router.put('/bookstore/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    const {
      bookstore,
      location,
      quantity,
      email,
      phone,
      owner,
      date,
      status,
      agent,
      state,
      zipcode

    } = req.body;
    console.log("Id ni sa bookstore", id);

    const [result] = await db.query(`
      UPDATE bookstore
      SET 
        bookstore = ?, 
        location = ?, 
        quantity = ?, 
        email = ?, 
        phone = ?, 
        owner = ?, 
        date = ?, 
        status = ?, 
        agent = ?,
        state = ?,
        zipcode = ?
      WHERE id = ?
    `, [
      bookstore,
      location,
      quantity,
      email,
      phone,
      owner,
      date,
      status,
      agent,
      state,
      zipcode,
      id
    ]);

    res.json({ message: 'Bookstore entry updated successfully' });

  } catch (error) {
    console.error('Error updating bookstore:', error);
    res.status(500).json({ error: 'Failed to update bookstore' });
  }
});

router.delete('/bookstore/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const [result] = await db.query(`
      DELETE FROM bookstore WHERE id = ?
    `, [id]);

    res.json({ message: 'Bookstore entry deleted successfully' });

  } catch (error) {
    console.error('Error deleting bookstore:', error);
    res.status(500).json({ error: 'Failed to delete bookstore entry' });
  }
});



router.get('/service-entries', async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(`
      SELECT id, date, services, author, book, price, 
             availability, genre, isbn, email, phone
      FROM nbsp_entries
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching service entries:', error);
    res.status(500).json({ error: 'Failed to fetch service entries' });
  }
});

router.post('/service-entries', async (req, res) => {
  try {
    const { 
      date, 
      services, 
      author,
      book, 
      price, 
      availability, 
      genre, 
      isbn, 
      email, 
      phone 
    } = req.body;

    const db = getDB();
    const [result] = await db.query(`
      INSERT INTO nbsp_entries 
        (date, services, author, book, price, availability, genre, isbn, email, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [date, services, author, book, price, availability, genre, isbn, email, phone]);

    res.status(201).json({
      id: result.insertId,
      message: 'Service entry created successfully'
    });
  } catch (error) {
    console.error('Error creating service entry:', error);
    res.status(500).json({ error: 'Failed to create service entry' });
  }
});

// Update entry
router.put('/service-entries/:id', async (req, res) => {
  try {
    const db = getDB();
    const { 
      date, 
      services, 
      author,
      book, 
      price, 
      availability, 
      genre, 
      isbn, 
      email, 
      phone 
    } = req.body;

    const [result] = await db.query(`
      UPDATE nbsp_entries 
      SET 
        date = ?,
        services = ?,
        author = ?,
        book = ?,
        price = ?,
        availability = ?,
        genre = ?,
        isbn = ?,
        email = ?,
        phone = ?
      WHERE id = ?
    `, [date, services, author, book, price, availability, genre, isbn, email, phone, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Fetch the updated record to return it
    const [rows] = await db.query('SELECT * FROM nbsp_entries WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
    
  } catch (error) {
    console.error('Error updating service entry:', error);
    res.status(500).json({ error: 'Failed to update service entry' });
  }
});

// Delete entry
router.delete('/service-entries/:id', async (req, res) => {
  try {
    const db = getDB();
    
    // Optional: First check if the entry exists
    const [check] = await db.query('SELECT id FROM nbsp_entries WHERE id = ?', [req.params.id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const [result] = await db.query('DELETE FROM nbsp_entries WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting service entry:', error);
    res.status(500).json({ error: 'Failed to delete service entry' });
  }
});

// router.get('/service-transactions', async (req, res) => {
//   try {
//     const db = getDB();

//     const [rows] = await db.query(`
//       SELECT 
//         transID,
//         transaction_id,
//         lead_name,
//         lead_owner,
//         trans_status,
//         service_name,
//         amount_pay,
//         payment_status,
//         tot_service_price,
//         remain_bal,
//         transaction_date,
//         last_updated,
//         lead_transferredTo,
//         status
//       FROM service_transactions
//       WHERE 
//         JSON_CONTAINS(service_name, '\"NBSP\"') 
//         OR JSON_CONTAINS(service_name, '\"INBSP\"')
//       ORDER BY transaction_date DESC
//     `);

//     res.json(rows);
//   } catch (error) {
//     console.error('Error fetching transactions:', error);
//     res.status(500).json({ error: 'Failed to fetch transactions' });
//   }
// });

router.get('/service-transactions', async (req, res) => {
  try {
    const db = getDB();

    const query = `
      SELECT 
        transID,
        transaction_id,
        lead_name,
        lead_owner,
        trans_status,
        service_name,
        amount_pay,
        payment_status,
        tot_service_price,
        remain_bal,
        transaction_date,
        last_updated,
        lead_transferredTo,
        status,
        date_nbsp_created,
        transaction_notes,
        book_availability_status,
        target_states_count,
        book_name,
        remaining,
        client_email,
        client_phone
      FROM service_transactions
      WHERE 
        -- Plain string match
        service_name IN (
          'NBSP',
          'INBSP',
          'National Bookstore Placement',
          'International National Bookstore Placement'
        )
        OR 
        -- JSON array match
        JSON_CONTAINS(service_name, '"NBSP"') OR
        JSON_CONTAINS(service_name, '"INBSP"') OR
        JSON_CONTAINS(service_name, '"National Bookstore Placement"') OR
        JSON_CONTAINS(service_name, '"International National Bookstore Placement"')
        OR
        -- Stringified JSON array
        (
          JSON_VALID(service_name) AND 
          (
            JSON_CONTAINS(JSON_EXTRACT(service_name, '$'), '"NBSP"') OR
            JSON_CONTAINS(JSON_EXTRACT(service_name, '$'), '"INBSP"') OR
            JSON_CONTAINS(JSON_EXTRACT(service_name, '$'), '"National Bookstore Placement"') OR
            JSON_CONTAINS(JSON_EXTRACT(service_name, '$'), '"International National Bookstore Placement"')
          )
        )
      ORDER BY transaction_date DESC
    `;

    const [rows] = await db.query(query);
    console.log('Fetched service transactions:', rows.length);

    // Normalize the service_name format in response
    const normalizedRows = rows.map(row => {
      try {
        const parsed = typeof row.service_name === 'string' 
          ? JSON.parse(row.service_name) 
          : row.service_name;
        
        return {
          ...row,
          service_name: Array.isArray(parsed) ? parsed : [parsed]
        };
      } catch (e) {
        return {
          ...row,
          service_name: [row.service_name]
        };
      }
    });

    res.json(normalizedRows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});




// Create NBSP Transaction
router.post('/nbsp-transactions', async (req, res) => {
  try {
    const db = getDB();
    const {
      services,
      authorName,
      bookName,
      price,
      bookAvailability,
      genre,
      isbn,
      emailAddress,
      contactNumber,
      targetStates,
      notes,
      agent,
      date,
      remaining
    } = req.body;

    

    // Insert the new transaction
    const [result] = await db.query(
      `INSERT INTO service_transactions 
      (service_name, lead_name, book_name, book_availability_status, book_genre, book_isbn, client_email, client_phone, target_states_count, transaction_notes,lead_owner,date_nbsp_created, remaining)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`,
      [
        services,
        authorName,
        bookName,
        bookAvailability,
        genre,
        isbn,
        emailAddress,
        contactNumber,
        targetStates,
        notes,
        agent,
        date,
        remaining
      ]
    );

    // Return the created transaction ID
    res.status(201).json({
      message: 'NBSP transaction created successfully',
      nbspId: result.insertId
    });

  } catch (error) {
    console.error('Error creating NBSP transaction:', error);
    res.status(500).json({ error: 'Failed to create NBSP transaction' });
  }
});


// GET endpoint for fetching a single transaction
router.get('/nbsp-edit/:transID', async (req, res) => {
  try {
    const db = getDB();
    const transactionId = req.params.transID;
    console.log('Fetching transaction with ID:', transactionId);

    const [rows] = await db.query(
      `SELECT * FROM service_transactions WHERE transID = ?`,
      [transactionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json(rows[0]);

  } catch (error) {
    console.error('Error fetching NBSP transaction:', error);
    res.status(500).json({ error: 'Failed to fetch NBSP transaction' });
  }
});

// PUT endpoint for updating a transaction
// router.put('/nbsp-transactions/:editingTransID', async (req, res) => {
//   try {
//     const db = getDB();
//     const transactionId = req.params.editingTransID;
//     const {
//       date,
//       services,
//       authorName,
//       bookName,
//       bookAvailability,
//       genre,
//       isbn,
//       emailAddress,
//       contactNumber,
//       targetStates,
//       notes,
//       agent,
//       remaining
//     } = req.body;
//     console.log('Updating transaction with ID:', transactionId);

//     // Validate required fields
    
//     // Update the transaction
//     await db.query(
//       `UPDATE service_transactions SET
//         date_nbsp_created = ?,
//         service_name = ?,
//         lead_name = ?,
//         book_name = ?,
//         book_availability_status = ?,
//         book_genre = ?,
//         book_isbn = ?,
//         client_email = ?,
//         client_phone = ?,
//         target_states_count = ?,
//         transaction_notes = ?,
//         lead_owner = ?,
//         remaining = ?
//       WHERE transID = ?`,
//       [
//         date,
//         services,
//         authorName,
//         bookName,
//         bookAvailability,
//         genre,
//         isbn,
//         emailAddress,
//         contactNumber,
//         targetStates ? parseInt(targetStates) : null,
//         notes,
//         agent,
//         remaining,
//         transactionId
//       ]
//     );

//     res.status(200).json({
//       message: 'NBSP transaction updated successfully'
//     });

//   } catch (error) {
//     console.error('Error updating NBSP transaction:', error);
//     res.status(500).json({ error: 'Failed to update NBSP transaction' });
//   }
// });
router.put('/nbsp-transactions/:editingTransID', async (req, res) => {
  try {
    const db = getDB();
    const transactionId = req.params.editingTransID;
    const {
      date,
      services,
      authorName,
      bookName,
      bookAvailability,
      genre,
      isbn,
      emailAddress,
      contactNumber,
      targetStates,
      notes,
      agent,
      remaining
    } = req.body;

    // Convert ISO date to MySQL datetime format
    const mysqlDate = date ? new Date(date).toISOString().slice(0, 19).replace('T', ' ') : null;

    await db.query(
  `UPDATE service_transactions SET
    date_nbsp_created = ?,
    service_name = ?,
    lead_name = ?,
    book_name = ?,
    book_availability_status = ?,
    book_genre = ?,
    book_isbn = ?,
    client_email = ?,
    client_phone = ?,
    target_states_count = ?,
    transaction_notes = ?,
    lead_owner = ?,
    remaining = ?
  WHERE transID = ?`,
  [
    date ? new Date(date).toISOString().slice(0, 19).replace('T', ' ') : null,
    services,
    authorName,
    bookName,
    bookAvailability,
    genre,
    isbn,
    emailAddress,
    contactNumber,
    targetStates ? parseInt(targetStates) : null,
    notes,
    agent,
    remaining === '' ? null : parseInt(remaining) || 0, // Handle empty string
    transactionId
  ]
);

    res.status(200).json({
      message: 'NBSP transaction updated successfully'
    });

  } catch (error) {
    console.error('Error updating NBSP transaction:', error);
    res.status(500).json({ error: 'Failed to update NBSP transaction' });
  }
});

// router.put('/nbsp-transactions-edit/:transID', async (req, res) => {
//   try {
//     const db = getDB();
//     const transactionId = req.params.transID;
//     const {
//       services,
//       authorName,
//       bookName,
//       price,
//       bookAvailability,
//       genre,
//       isbn,
//       emailAddress,
//       contactNumber,
//       targetStates,
//       notes,
//       agent
//     } = req.body;

//     // Validate required fields
//     if (!services || !authorName || !bookName || !price) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Update the transaction
//     await db.query(
//       `UPDATE service_transactions SET
//         service_name = ?,
//         lead_name = ?,
//         book_name = ?,
//         amount_pay = ?,
//         book_availability_status = ?,
//         book_genre = ?,
//         book_isbn = ?,
//         client_email = ?,
//         client_phone = ?,
//         target_states_count = ?,
//         transaction_notes = ?,
//         lead_owner = ?
//       WHERE transID = ?`,
//       [
//         services,
//         authorName,
//         bookName,
//         parseFloat(price),
//         bookAvailability,
//         genre,
//         isbn,
//         emailAddress,
//         contactNumber,
//         targetStates ? parseInt(targetStates) : null,
//         notes,
//         agent,
//         transactionId
//       ]
//     );

//     res.status(200).json({
//       message: 'NBSP transaction updated successfully'
//     });

//   } catch (error) {
//     console.error('Error updating NBSP transaction:', error);
//     res.status(500).json({ error: 'Failed to update NBSP transaction' });
//   }
// });

// // GET /api/nbsp-transactions/:id - Get a single transaction
// router.get('/nbsp-transactions/:editingTransID', async (req, res) => {
//   try {
//     const db = getDB();
//     const transactionId = req.params.editingTransID;
//     console.log('Fetching transaction with ID:', transactionId);

//     const [rows] = await db.query(
//       `SELECT * FROM service_transactions WHERE transID = ?`,
//       [transactionId]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Transaction not found' });
//     }

//     res.status(200).json(rows[0]);

//   } catch (error) {
//     console.error('Error fetching NBSP transaction:', error);
//     res.status(500).json({ error: 'Failed to fetch NBSP transaction' });
//   }
// });

// DELETE /api/nbsp-transactions/:id - Delete a transaction
router.delete('/nbsp-transactions-delete/:transID', async (req, res) => {
  try {
    const db = getDB();
    const transactionId = req.params.transID;
    console.log('Deleting transaction with ID:', transactionId);

    // Delete the transaction
    await db.query(
      `DELETE FROM service_transactions WHERE transID = ?`,
      [transactionId]
    );

    res.status(200).json({
      message: 'NBSP transaction deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting NBSP transaction:', error);
    res.status(500).json({ error: 'Failed to delete NBSP transaction' });
  }
});

router.post('/upload-fulfillment', upload.single('file'), async (req, res) => {
  const db = getDB();
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const { originalname, filename, mimetype, size } = req.file;
    const filePath = `/uploads/${filename}`;

    // Insert into sample_fulfillment table
    const [result] = await db.execute(
      `INSERT INTO sample_fulfillment 
       (filename, filepath, filetype) 
       VALUES (?, ?, ?)`,
      [originalname, filePath, mimetype]
    );

    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: result.insertId,
      filename: originalname,
      filepath: filePath,
      filetype: mimetype,
      filesize: size
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Failed to save file information',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

router.get('/fulfillment-files', async (req, res) => {
  const db = getDB();
  
  try {
    const [files] = await db.execute(
      `SELECT id, filename, filepath, filetype 
       FROM sample_fulfillment 
       ORDER BY id DESC`
    );
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

router.delete('/fulfillment-files/:id', async (req, res) => {
  const db = getDB();
  const { id } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT filepath FROM sample_fulfillment WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '../../uploads', rows[0].filepath);
    
    // Delete from database
    await db.execute(
      `DELETE FROM sample_fulfillment WHERE id = ?`,
      [id]
    );

    // Delete physical file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: 'File deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// 1. Set the EXACT upload directory path
const UPLOAD_BASE = 'C:\\Users\\belnas\\Desktop\\reactProj\\411Socials\\backend\\uploads';

// 2. File download endpoint
router.get('/fulfillment/:id', async (req, res) => {
  try {
    // Get file record from database
    const [rows] = await getDB().execute(
      `SELECT filename, filepath, filetype 
       FROM sample_fulfillment 
       WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'File record not found' });
    }

    const file = rows[0];
    
    // 3. Clean the filepath - remove any "uploads/" prefix
    const cleanPath = file.filepath.replace(/^\/?uploads\//, '');
    
    // 4. Join with base directory (NO duplicate "uploads")
    const fullPath = path.join(UPLOAD_BASE, cleanPath);
    
    console.log('Final file path:', fullPath); // Debug log

    if (!fs.existsSync(fullPath)) {
      console.log('Actual files in directory:', fs.readdirSync(UPLOAD_BASE));
      return res.status(404).json({ 
        error: 'File not found',
        details: `Server looked for: ${fullPath}`
      });
    }

    // Stream the file
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Content-Type', file.filetype || 'application/octet-stream');
    
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Get agent's assigned chats
router.get('/agent/chats', async (req, res) => {
  const db = getDB();
  try {
    const agentId = req.session.userId;

    // ✅ Step 1: Get list of unique visitor emails with their latest message timestamp
    const [chats] = await db.query(`
      SELECT email, MAX(created_at) AS last_message_at
      FROM visitor_messages
      WHERE agent_id = ?
      GROUP BY email
      ORDER BY last_message_at DESC
    `, [agentId]);

    // ✅ Step 2: For each chat/email, fetch unread count and last message details
    const chatDetails = [];
    for (const chat of chats) {
      const email = chat.email;

      // ✅ Count unread messages from visitor
      const [unread] = await db.query(`
        SELECT COUNT(*) AS unread_count
        FROM visitor_messages
        WHERE email = ?
          AND agent_id = ?
          AND is_agent_message = 0
          AND read_at IS NULL
      `, [email, agentId]);

      // ✅ Get last message details
      const [lastMessage] = await db.query(`
        SELECT 
          message,
          created_at AS timestamp,
          is_agent_message AS isAgent
        FROM visitor_messages
        WHERE email = ? AND agent_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `, [email, agentId]);

      chatDetails.push({
        email,
        unread_count: unread[0]?.unread_count || 0,
        lastMessage: lastMessage[0] || null,
        last_message_at: chat.last_message_at
      });
    }

    // ✅ Already ordered by last_message_at DESC in SQL — no need to sort again
    res.json({ chats: chatDetails });
  } catch (error) {
    console.error('Error fetching agent chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// router.get('/agent/chats', async (req, res) => {
//   const db = getDB();
//   try {
//     // Get current agent ID from session
//     const agentId = req.session.userId;
    
//     // First get all unique visitor emails that messaged this agent
//     const [chats] = await db.query(`
//       SELECT DISTINCT email 
//       FROM visitor_messages 
//       WHERE agent_id = ?
//       ORDER BY created_at DESC
//     `, [agentId]);

//     // Get details for each chat
//     const chatDetails = [];
//     for (const chat of chats) {
//       // Get unread message count (client messages not read yet)
//       const [unread] = await db.query(`
//         SELECT COUNT(*) as unread_count
//         FROM visitor_messages
//         WHERE email = ? 
//           AND agent_id = ?
//           AND is_agent_message = 0
//           AND read_at IS NULL
//       `, [chat.email, agentId]);

//       // Get last message in the conversation
//       const [lastMessage] = await db.query(`
//         SELECT 
//           message, 
//           created_at as timestamp, 
//           is_agent_message as isAgent
//         FROM visitor_messages
//         WHERE email = ? AND agent_id = ?
//         ORDER BY created_at DESC
//         LIMIT 1
//       `, [chat.email, agentId]);

//       chatDetails.push({
//         email: chat.email,
//         unread_count: unread[0].unread_count || 0,
//         lastMessage: lastMessage[0] || null,
//         last_message_at: lastMessage[0]?.timestamp || null
//       });
//     }

//     // Sort by most recent message
//     chatDetails.sort((a, b) => 
//       new Date(b.last_message_at) - new Date(a.last_message_at)
//     );

//     res.json({ chats: chatDetails });
//   } catch (error) {
//     console.error('Error fetching agent chats:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Get chat messages
router.get('/chat/messages', async (req, res) => {
  const db = getDB();
  try {
    const { email } = req.query;
    const agentId = req.session.userId;
    
    // Verify this agent is assigned to this chat
    const [visitor] = await db.query(
      'SELECT assigned_agent_id FROM visitors WHERE email = ?',
      [email]
    );
    
    if (!visitor.length || visitor[0].assigned_agent_id !== agentId) {
      return res.status(403).json({ error: 'Not authorized to access this chat' });
    }

    // Mark messages as read
    await db.query(`
      UPDATE visitor_messages 
      SET read_at = NOW() 
      WHERE email = ? AND is_agent_message = 0 AND read_at IS NULL
    `, [email]);

    // Get all messages
    const [messages] = await db.query(`
      SELECT message, timestamp, is_agent_message as isAgent
      FROM visitor_messages
      WHERE email = ?
      ORDER BY timestamp ASC
    `, [email]);

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/chat/send', async (req, res) => {
  const db = getDB();
  try {
    const { email, message, isAgent } = req.body;
    const agentId = req.session.userId;
    
    // Verify this agent is assigned to this chat
    const [visitor] = await db.query(
      'SELECT assigned_agent_id FROM visitors WHERE email = ?',
      [email]
    );
    
    if (!visitor.length || visitor[0].assigned_agent_id !== agentId) {
      return res.status(403).json({ error: 'Not authorized to send to this chat' });
    }

    // Save message
    await db.query(`
      INSERT INTO visitor_messages 
      (email, message, timestamp, agent_id, is_agent_message)
      VALUES (?, ?, NOW(), ?, ?)
    `, [email, message, agentId, isAgent]);

    // Update last message time
    await db.query(`
      UPDATE visitors 
      SET last_message_at = NOW() 
      WHERE email = ?
    `, [email]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get all users with status
router.get('/all-users', async (req, res) => {
  const db = getDB();

  try {
    const [users] = await db.execute(`
      SELECT id, email, role, status, created_at, updated_at 
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user with status
router.put('/all-users/:id', async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { email, role, status } = req.body;
  console.log("show:", req.body);

  try {
    // Basic validation
    if (!email || !role || !status) {
      return res.status(400).json({ error: 'Email, role and status are required' });
    }

    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either active or inactive' });
    }

    await db.execute(
      'UPDATE users SET email = ?, role = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [email, role, status, id]
    );

    // Get updated user
    const [updatedUser] = await db.execute(
      'SELECT id, email, role, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json(updatedUser[0]);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});




// Get all sales
router.get('/sales', async (req, res) => {
  const db = getDB();
  try {
    // Get all sales records
    const [sales] = await db.query(`
      SELECT 
        id,
        date,
        payment_type,
        full_payment_amount,
        service_amount,
        service,
        author,
        lead_owner,
        closer,
        payment_method,
        payment_status,
        notes,
        total_amount_paid,
        balance,
        created_at
      FROM sales_reports 
      ORDER BY date DESC
    `);

    // Get all payments for these sales
    const [payments] = await db.query(`
      SELECT 
        id,
        sale_id,
        amount,
        payment_date as date,
        payment_number,
        payment_method as method
      FROM sales_payments
      ORDER BY sale_id, payment_number
    `);

    // Combine sales with their payments
    const salesWithPayments = sales.map(sale => {
      if (sale.payment_type === 'installment') {
        sale.payments = payments.filter(p => p.sale_id === sale.id)
          .map(p => ({
            id: p.id,
            amount: p.amount,
            date: p.date,
            method: p.method,
            paymentNumber: p.payment_number
          }));
      }
      return sale;
    });

    res.json(salesWithPayments);
  } catch (error) {
    console.error('Error fetching all sales data:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

// Create new sale
router.post('/sales', async (req, res) => {
  const db = getDB();
  try {
    const {
      date,
      paymentType,
      fullPaymentAmount,
      serviceAmount,
      service,
      author,
      leadOwner,
      closer,
      paymentMethod,
      paymentStatus,
      notes,
      totalAmountPaid,
      balance,
      payments
    } = req.body;

    // Enhanced validation
    const errors = [];
    if (!date) errors.push('Date is required');
    if (!service) errors.push('Service is required');
    if (!serviceAmount || isNaN(serviceAmount)) errors.push('Valid service amount is required');
    if (!author) errors.push('Author is required');
    if (!leadOwner) errors.push('Lead owner is required');
    if (!closer) errors.push('Closer is required');
    
    if (paymentType === 'full') {
      if (!fullPaymentAmount || isNaN(fullPaymentAmount)) {
        errors.push('Valid full payment amount is required');
      }
      if (!paymentMethod) errors.push('Payment method is required');
    } else {
      if (!payments || payments.length === 0) {
        errors.push('At least one payment is required for installment');
      } else {
        payments.forEach((payment, index) => {
          if (!payment.amount || isNaN(payment.amount)) {
            errors.push(`Payment ${index + 1}: Valid amount is required`);
          }
          if (!payment.date) {
            errors.push(`Payment ${index + 1}: Date is required`);
          }
          if (!payment.method) {
            errors.push(`Payment ${index + 1}: Payment method is required`);
          }
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    await db.query('START TRANSACTION');

    // Insert main sales record
    const [result] = await db.query(`
      INSERT INTO sales_reports (
        date,
        payment_type,
        full_payment_amount,
        service_amount,
        service,
        author,
        lead_owner,
        closer,
        payment_method,
        payment_status,
        notes,
        total_amount_paid,
        balance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      date,
      paymentType,
      paymentType === 'full' ? fullPaymentAmount : null,
      serviceAmount,
      service,
      author,
      leadOwner,
      closer,
      paymentMethod,
      paymentStatus,
      notes,
      totalAmountPaid,
      balance
    ]);

    const saleId = result.insertId;

    // Insert payments if installment type
    if (paymentType === 'installment') {
      for (const [index, payment] of payments.entries()) {
        await db.query(`
          INSERT INTO sales_payments (
            sale_id,
            amount,
            payment_date,
            payment_number,
            payment_method
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          saleId,
          payment.amount,
          payment.date, // Use the individual payment date
          index + 1,
          payment.method,
        ]);
      }
    }

    await db.query('COMMIT');

    res.status(201).json({ 
      message: 'Sales data saved successfully', 
      insertId: saleId 
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error saving sales data:', error);
    res.status(500).json({ 
      error: 'Failed to save sales data',
      details: error.message 
    });
  }
});

// Update sale
router.put('/sales/:id', async (req, res) => {
  const db = getDB();
  try {
    const saleId = req.params.id;
    const {
      date,
      paymentType,
      fullPaymentAmount,
      serviceAmount,
      service,
      author,
      leadOwner,
      closer,
      paymentMethod,
      paymentStatus,
      notes,
      totalAmountPaid,
      balance,
      payments
    } = req.body;

    // Enhanced validation
    const errors = [];
    if (!date) errors.push('Date is required');
    if (!service) errors.push('Service is required');
    if (!serviceAmount || isNaN(serviceAmount)) errors.push('Valid service amount is required');
    if (!author) errors.push('Author is required');
    if (!leadOwner) errors.push('Lead owner is required');
    if (!closer) errors.push('Closer is required');
    
    if (paymentType === 'full') {
      if (!fullPaymentAmount || isNaN(fullPaymentAmount)) {
        errors.push('Valid full payment amount is required');
      }
      if (!paymentMethod) errors.push('Payment method is required');
    } 
    
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    // Format dates for MySQL (remove time and timezone)
    const formatDateForMySQL = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    const formattedMainDate = formatDateForMySQL(date);

    await db.query('START TRANSACTION');

    // Update main sales record
    await db.query(`
      UPDATE sales_reports SET
        date = ?,
        payment_type = ?,
        full_payment_amount = ?,
        service_amount = ?,
        service = ?,
        author = ?,
        lead_owner = ?,
        closer = ?,
        payment_method = ?,
        payment_status = ?,
        notes = ?,
        total_amount_paid = ?,
        balance = ?
      WHERE id = ?
    `, [
      formattedMainDate, // Use formatted date here
      paymentType,
      paymentType === 'full' ? fullPaymentAmount : null,
      serviceAmount,
      service,
      author,
      leadOwner,
      closer,
      paymentMethod,
      paymentStatus,
      notes,
      totalAmountPaid,
      balance,
      saleId
    ]);

    // Delete all existing payments
    await db.query('DELETE FROM sales_payments WHERE sale_id = ?', [saleId]);

    // Insert updated payments if installment type
    if (paymentType === 'installment') {
      for (const [index, payment] of payments.entries()) {
        // Format the payment date
        const formattedPaymentDate = formatDateForMySQL(payment.date);
        
        await db.query(`
          INSERT INTO sales_payments (
            sale_id,
            amount,
            payment_date,
            payment_number,
            payment_method
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          saleId,
          payment.amount,
          formattedPaymentDate, // Use the formatted date
          index + 1,
          payment.method,
        ]);
      }
    }

    await db.query('COMMIT');

    res.status(200).json({ 
      message: 'Sales data updated successfully',
      updatedId: saleId
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating sales data:', error);
    res.status(500).json({ 
      error: 'Failed to update sales data',
      details: error.message 
    });
  }
});

router.delete('/sales/:id', async (req, res) => {
  try {
    const db = getDB();
    const saleId = req.params.id;
    
    await db.query('DELETE FROM sales_payments WHERE sale_id = ?', [saleId]);
    await db.query('DELETE FROM sales_reports WHERE id = ?', [saleId]);
    
    res.status(200).json({ message: 'Sales data deleted successfully' });
  } catch (error) {
    console.error('Error deleting sales data:', error);
    res.status(500).json({ error: 'Failed to delete sales data' });
  }
});

// Delete payment
router.delete('/payments/:id', async (req, res) => {
  try {
    const db = getDB();
    const paymentId = req.params.id;
    
    await db.query('DELETE FROM sales_payments WHERE id = ?', [paymentId]);
    
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Get sales by date range (considers both sale date and payment dates)
router.get('/sales/range', async (req, res) => {
  const db = getDB();
  const { start, end } = req.query;

  try {
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    // Get sales where either the sale date or any payment date falls within the range
    const [sales] = await db.query(`
      SELECT DISTINCT sr.* 
      FROM sales_reports sr
      LEFT JOIN sales_payments sp ON sr.id = sp.sale_id
      WHERE (
        sr.date BETWEEN ? AND ? 
        OR sp.payment_date BETWEEN ? AND ?
      )
      ORDER BY sr.date DESC
    `, [start, end, start, end]);

    // Get payments for these sales
    const saleIds = sales.map(s => s.id);
    const [payments] = saleIds.length > 0 ? await db.query(`
      SELECT * FROM sales_payments
      WHERE sale_id IN (?)
      ORDER BY sale_id, payment_number
    `, [saleIds]) : [[]];

    // Combine sales with payments
    const salesWithPayments = sales.map(sale => {
      if (sale.payment_type === 'installment') {
        sale.payments = payments.filter(p => p.sale_id === sale.id)
          .map(p => ({
            id: p.id,
            amount: p.amount,
            date: p.payment_date,
            method: p.payment_method,
            paymentNumber: p.payment_number
          }));
      }
      return sale;
    });

    res.json(salesWithPayments);
  } catch (error) {
    console.error('Error fetching sales data by range:', error);
    res.status(500).json({ error: 'Failed to fetch sales data by range' });
  }
});

// Get sales by month (more efficient approach)
router.get('/sales/month/:month', async (req, res) => {
  const db = getDB();
  const { month } = req.params;

  try {
    // Get sales and only the payments that match the month filter
    const [sales] = await db.query(`
      SELECT 
        sr.*,
        CASE 
          WHEN sr.payment_type = 'installment' THEN
            COALESCE(
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', sp.id,
                  'amount', sp.amount,
                  'date', sp.payment_date,
                  'method', sp.payment_method,
                  'paymentNumber', sp.payment_number
                )
              ),
              JSON_ARRAY()
            )
          ELSE NULL
        END as payments
      FROM sales_reports sr
      LEFT JOIN sales_payments sp ON sr.id = sp.sale_id 
        AND sr.payment_type = 'installment'
        AND DATE_FORMAT(sp.payment_date, '%Y-%m') = ?
      WHERE (
        (sr.payment_type = 'full' AND DATE_FORMAT(sr.date, '%Y-%m') = ?)
        OR (sr.payment_type = 'installment' AND sp.id IS NOT NULL)
      )
      GROUP BY sr.id
      ORDER BY sr.date DESC
    `, [month, month]);

    // Process the sales data - handle both string JSON and already-parsed objects
    const salesWithPayments = sales.map(sale => {
      if (sale.payment_type === 'installment') {
        // Check if payments is already an object/array (parsed by MySQL driver)
        if (typeof sale.payments === 'object' && sale.payments !== null) {
          // Already parsed, use as is
          sale.payments = sale.payments;
        } 
        // Check if payments is a JSON string that needs parsing
        else if (typeof sale.payments === 'string') {
          try {
            sale.payments = JSON.parse(sale.payments);
          } catch (error) {
            console.error('Error parsing payments JSON:', error);
            sale.payments = [];
          }
        }
        // Handle null/undefined cases
        else {
          sale.payments = [];
        }
      }
      return sale;
    });

    res.json(salesWithPayments);
  } catch (error) {
    console.error('Error fetching sales data by month:', error);
    res.status(500).json({ error: 'Failed to fetch sales data by month' });
  }
});

// Get sales for current year (considers both sale date and payment dates)
router.get('/sales/year/current', async (req, res) => {
  const db = getDB();
  const currentYear = new Date().getFullYear();

  try {
    // Get sales for current year (either sale date or payment date)
    const [sales] = await db.query(`
      SELECT DISTINCT sr.* 
      FROM sales_reports sr
      LEFT JOIN sales_payments sp ON sr.id = sp.sale_id
      WHERE (
        YEAR(sr.date) = ?
        OR YEAR(sp.payment_date) = ?
      )
      ORDER BY sr.date DESC
    `, [currentYear, currentYear]);

    // Get payments for these sales
    const saleIds = sales.map(s => s.id);
    const [payments] = saleIds.length > 0 ? await db.query(`
      SELECT * FROM sales_payments
      WHERE sale_id IN (?)
      ORDER BY sale_id, payment_number
    `, [saleIds]) : [[]];

    // Combine sales with payments
    const salesWithPayments = sales.map(sale => {
      if (sale.payment_type === 'installment') {
        sale.payments = payments.filter(p => p.sale_id === sale.id)
          .map(p => ({
            id: p.id,
            amount: p.amount,
            date: p.payment_date,
            method: p.payment_method,
            paymentNumber: p.payment_number
          }));
      }
      return sale;
    });

    res.json(salesWithPayments);
  } catch (error) {
    console.error('Error fetching current year sales data:', error);
    res.status(500).json({ error: 'Failed to fetch current year sales data' });
  }
});

// Get sales for current week (considers both sale date and payment dates)
router.get('/sales/week/current', async (req, res) => {
  const db = getDB();
  const currentDate = new Date();
  const firstDay = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
  const lastDay = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));

  // Format dates for MySQL
  const firstDayStr = firstDay.toISOString().split('T')[0];
  const lastDayStr = lastDay.toISOString().split('T')[0];

  try {
    // Get sales for current week (either sale date or payment date)
    const [sales] = await db.query(`
      SELECT DISTINCT sr.* 
      FROM sales_reports sr
      LEFT JOIN sales_payments sp ON sr.id = sp.sale_id
      WHERE (
        sr.date BETWEEN ? AND ?
        OR sp.payment_date BETWEEN ? AND ?
      )
      ORDER BY sr.date DESC
    `, [firstDayStr, lastDayStr, firstDayStr, lastDayStr]);

    // Get payments for these sales
    const saleIds = sales.map(s => s.id);
    const [payments] = saleIds.length > 0 ? await db.query(`
      SELECT * FROM sales_payments
      WHERE sale_id IN (?)
      ORDER BY sale_id, payment_number
    `, [saleIds]) : [[]];

    // Combine sales with payments
    const salesWithPayments = sales.map(sale => {
      if (sale.payment_type === 'installment') {
        sale.payments = payments.filter(p => p.sale_id === sale.id)
          .map(p => ({
            id: p.id,
            amount: p.amount,
            date: p.payment_date,
            method: p.payment_method,
            paymentNumber: p.payment_number
          }));
      }
      return sale;
    });

    res.json(salesWithPayments);
  } catch (error) {
    console.error('Error fetching current week sales data:', error);
    res.status(500).json({ error: 'Failed to fetch current week sales data' });
  }
});




// GET all publication services
router.get('/publication_services', async (req, res) => {
  const db = getDB();
  const [rows] = await db.query('SELECT * FROM publication_services');
  res.json(rows);
});

// POST route
router.post('/publication_services', async (req, res) => {
  const db = getDB();
  const { Author_name, services, book_name, notes, fulfillment_status, fulfillment_date } = req.body;
  
  // Format the date to YYYY-MM-DD
  const formattedDate = fulfillment_date ? new Date(fulfillment_date).toISOString().split('T')[0] : null;
  
  await db.query(
    'INSERT INTO publication_services (author_name, services, book_name, notes, fulfillment_status, fulfillment_date) VALUES (?, ?, ?, ?, ?, ?)',
    [Author_name, services, book_name, notes, fulfillment_status, formattedDate]
  );
  res.sendStatus(200);
});

// PUT route
router.put('/publication_services/:id', async (req, res) => {
  const db = getDB();
  const { Author_name, services, book_name, notes, fulfillment_status, fulfillment_date } = req.body;
  const { id } = req.params;
  
  // Format the date to YYYY-MM-DD
  const formattedDate = fulfillment_date ? new Date(fulfillment_date).toISOString().split('T')[0] : null;
  
  await db.query(
    'UPDATE publication_services SET author_name=?, services=?, book_name=?, notes=?, fulfillment_status=?, fulfillment_date=? WHERE id=?',
    [Author_name, services, book_name, notes, fulfillment_status, formattedDate, id]
  );
  res.sendStatus(200);
});

// DELETE publication service
router.delete('/publication_services/:id', async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  
  await db.query('DELETE FROM publication_services WHERE id=?', [id]);
  res.sendStatus(200);
});


// GET all publication services
router.get('/fulfillment_services', async (req, res) => {
  const db = getDB();
  const [rows] = await db.query('SELECT * FROM fulfillment_services');
  res.json(rows);
});

// POST route
router.post('/fulfillment_services', async (req, res) => {
  const db = getDB();
  const { author_name, service_type, book_name, notes, fulfillment_status, fulfillment_date } = req.body;
  
  // Format the date to YYYY-MM-DD
  const formattedDate = fulfillment_date ? new Date(fulfillment_date).toISOString().split('T')[0] : null;
  
  await db.query(
    'INSERT INTO fulfillment_services (author_name, service_type, book_name, notes, fulfillment_status, fulfillment_date) VALUES (?, ?, ?, ?, ?, ?)',
    [author_name, service_type, book_name, notes, fulfillment_status, formattedDate]
  );
  res.sendStatus(200);
});

// PUT route
router.put('/fulfillment_services/:id', async (req, res) => {
  const db = getDB();
  const { author_name, service_type, book_name, notes, fulfillment_status, fulfillment_date } = req.body;
  const { id } = req.params;
  
  // Format the date to YYYY-MM-DD
  const formattedDate = fulfillment_date ? new Date(fulfillment_date).toISOString().split('T')[0] : null;
  
  await db.query(
    'UPDATE fulfillment_services SET author_name=?, service_type=?, book_name=?, notes=?, fulfillment_status=?, fulfillment_date=? WHERE id=?',
    [author_name, service_type, book_name, notes, fulfillment_status, formattedDate, id]
  );
  res.sendStatus(200);
});

// DELETE publication service
router.delete('/fulfillment_services/:id', async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  
  await db.query('DELETE FROM fulfillment_services WHERE id=?', [id]);
  res.sendStatus(200);
});

// Get all commissions
router.get('/commissions', async (req, res) => {
  try {
    const db = getDB();
    const [results] = await db.query('SELECT * FROM commissions ORDER BY created_at DESC, id DESC');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single commission
router.get('/commissions/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const [results] = await db.query('SELECT * FROM commissions WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Commission not found' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new commission
router.post('/commissions', async (req, res) => {
  try {
    const db = getDB();
    const {
      agent_name,
      author_name,
      services,
      commission_rate,
      payment_date,
      amount,
      deduction,
      total_commission,
      created_at
    } = req.body;

    const query = `
      INSERT INTO commissions 
      (agent_name, author_name, services, commission_rate, payment_date, amount, deduction, total_commission, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [results] = await db.query(
      query,
      [
        agent_name,
        author_name,
        services,
        commission_rate,
        payment_date,
        amount,
        deduction || 0,
        total_commission,
        created_at
      ]
    );
    
    res.status(201).json({ id: results.insertId, message: 'Commission created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a commission
router.put('/commissions/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const {
      agent_name,
      author_name,
      services,
      commission_rate,
      payment_date,
      amount,
      deduction,
      total_commission
    } = req.body;

    const query = `
      UPDATE commissions 
      SET agent_name = ?, author_name = ?, services = ?, commission_rate = ?, 
          payment_date = ?, amount = ?, deduction = ?, total_commission = ?
      WHERE id = ?
    `;

    const [results] = await db.query(
      query,
      [
        agent_name,
        author_name,
        services,
        commission_rate,
        payment_date,
        amount,
        deduction || 0,
        total_commission,
        id
      ]
    );
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Commission not found' });
    }
    res.json({ message: 'Commission updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a commission
router.delete('/commissions/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const [results] = await db.query('DELETE FROM commissions WHERE id = ?', [id]);
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Commission not found' });
    }
    res.json({ message: 'Commission deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all deductions or filter by agent/month/year
router.get('/deductions', async (req, res) => {
  try {
    const db = getDB();
    const { agent, month, year } = req.query;
    
    let query = 'SELECT * FROM deductions';
    const params = [];
    
    if (agent || month || year) {
      query += ' WHERE';
      const conditions = [];
      
      if (agent) {
        conditions.push(' agent_name = ?');
        params.push(agent);
      }
      
      if (month) {
        conditions.push(' month = ?');
        params.push(month);
      }
      
      if (year) {
        conditions.push(' year = ?');
        params.push(year);
      }
      
      query += conditions.join(' AND');
    }
    
    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new deduction
router.post('/deductions', async (req, res) => {
  try {
    const db = getDB();
    const { agent_name, amount, month, year } = req.body;

    const query = `
      INSERT INTO deductions 
      (agent_name, amount, month, year)
      VALUES (?, ?, ?, ?)
    `;

    const [results] = await db.query(
      query,
      [agent_name, amount, month, year]
    );
    
    res.status(201).json({ id: results.insertId, message: 'Deduction created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a deduction
router.put('/deductions/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { agent_name, amount, month, year } = req.body;

    const query = `
      UPDATE deductions 
      SET agent_name = ?, amount = ?, month = ?, year = ?
      WHERE id = ?
    `;

    const [results] = await db.query(
      query,
      [agent_name, amount, month, year, id]
    );
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Deduction not found' });
    }
    res.json({ message: 'Deduction updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single receipt by ID with authors and services
router.get('/receipts/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    // Get the receipt
    const receiptQuery = 'SELECT * FROM receipts WHERE id = ?';
    const [receiptResults] = await db.query(receiptQuery, [id]);
    
    if (receiptResults.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    const receipt = receiptResults[0];
    
    // Get authors for this receipt
    const authorsQuery = 'SELECT * FROM receipt_authors WHERE receipt_id = ?';
    const [authors] = await db.query(authorsQuery, [id]);
    
    // For each author, get their services
    for (let author of authors) {
      const servicesQuery = 'SELECT * FROM receipt_services WHERE author_id = ?';
      const [services] = await db.query(servicesQuery, [author.id]);
      author.services = services;
    }
    
    receipt.authors = authors;
    
    // Calculate balance if not already set
    if (receipt.balance === null || receipt.balance === undefined) {
      const totalAmount = parseFloat(receipt.total_amount) || 0;
      const amountPaid = parseFloat(receipt.amount_paid) || 0;
      receipt.balance = totalAmount - amountPaid;
    }
    
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all receipts with authors, services, and past payments
router.get('/receipts', async (req, res) => {
  try {
    const db = getDB();
    
    // Get all receipts
    const receiptsQuery = 'SELECT * FROM receipts ORDER BY payment_date DESC';
    const [receipts] = await db.query(receiptsQuery);
    
    // For each receipt, get authors, services, and past payments
    for (let receipt of receipts) {
      // Get authors for this receipt
      const authorsQuery = 'SELECT * FROM receipt_authors WHERE receipt_id = ?';
      const [authors] = await db.query(authorsQuery, [receipt.id]);
      
      // For each author, get their services
      for (let author of authors) {
        const servicesQuery = 'SELECT * FROM receipt_services WHERE author_id = ?';
        const [services] = await db.query(servicesQuery, [author.id]);
        author.services = services;
      }
      
      receipt.authors = authors;
      
      // Get past payments for this receipt
      const pastPaymentsQuery = 'SELECT * FROM receipt_past_payments WHERE receipt_id = ? ORDER BY payment_date';
      const [pastPayments] = await db.query(pastPaymentsQuery, [receipt.id]);
      receipt.past_payments = pastPayments;
      
      // Calculate balance if not already set
      if (receipt.balance === null || receipt.balance === undefined) {
        const totalAmount = parseFloat(receipt.total_amount) || 0;
        const totalAmountPaid = parseFloat(receipt.total_amount_paid) || 0;
        receipt.balance = Math.max(0, totalAmount - totalAmountPaid);
      }
    }
    
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new receipt with authors, services, and past payments
router.post('/receipts', async (req, res) => {
  const db = getDB();  
  try {
    await db.beginTransaction();
    
    const { 
      authors, 
      payment_date, 
      payment_method, 
      status, 
      notes, 
      receipt_number,
      amount_paid,
      past_payments,
      total_amount_paid,
      balance
    } = req.body;

    // Validate payment method
    const validPaymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'PayPal', 'Other'];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Validate status
    const validStatuses = ['Fully Paid', 'Pending', 'Partial'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Calculate total amount from all authors
    const total_amount = authors.reduce((total, author) => {
      return total + (parseFloat(author.total_amount) || 0);
    }, 0).toFixed(2);

    // Insert the receipt
    const receiptQuery = `
      INSERT INTO receipts 
      (total_amount, payment_date, payment_method, status, notes, receipt_number, 
       amount_paid, total_amount_paid, balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [receiptResult] = await db.query(
      receiptQuery,
      [total_amount, payment_date, payment_method, status, notes, receipt_number, 
       amount_paid, total_amount_paid, balance]
    );
    
    const receiptId = receiptResult.insertId;
    
    // Insert authors and their services
    for (const author of authors) {
      // Insert author
      const authorQuery = `
        INSERT INTO receipt_authors 
        (receipt_id, author_name, total_amount)
        VALUES (?, ?, ?)
      `;
      
      const [authorResult] = await db.query(
        authorQuery,
        [receiptId, author.author_name, author.total_amount]
      );
      
      const authorId = authorResult.insertId;
      
      // Insert services for this author
      for (const service of author.services) {
        const serviceQuery = `
          INSERT INTO receipt_services 
          (author_id, service_name, amount)
          VALUES (?, ?, ?)
        `;
        
        await db.query(
          serviceQuery,
          [authorId, service.name, service.amount]
        );
      }
    }
    
    // Insert past payments if they exist
    if (past_payments && past_payments.length > 0) {
      for (const payment of past_payments) {
        const pastPaymentQuery = `
          INSERT INTO receipt_past_payments 
          (receipt_id, payment_date, amount, receipt_number)
          VALUES (?, ?, ?, ?)
        `;
        
        await db.query(
          pastPaymentQuery,
          [receiptId, payment.date, payment.amount, payment.receipt_number]
        );
      }
    }
    
    await db.commit();
    
    res.status(201).json({ 
      id: receiptId, 
      message: 'Receipt created successfully' 
    });
  } catch (err) {
    await db.rollback();
    res.status(500).json({ error: err.message });
  } 
});

// PUT update receipt with authors, services, and past payments
router.put('/receipts/:id', async (req, res) => {
  const db = getDB();
  
  try {
    await db.beginTransaction();
    
    const { id } = req.params;
    const { 
      authors, 
      payment_date, 
      payment_method, 
      status, 
      notes,
      amount_paid,
      past_payments,
      total_amount_paid,
      balance
    } = req.body;

    console.log("all req.body", req.body);

    // Validate payment method
    const validPaymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'PayPal', 'Other'];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Validate status
    const validStatuses = ['Fully Paid', 'Pending', 'Partial'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Calculate total amount from all authors
    const total_amount = authors.reduce((total, author) => {
      return total + (parseFloat(author.total_amount) || 0);
    }, 0).toFixed(2);

    // Update the receipt
    const receiptQuery = `
      UPDATE receipts 
      SET total_amount = ?, payment_date = ?, payment_method = ?, status = ?, 
          notes = ?, amount_paid = ?, total_amount_paid = ?, balance = ?
      WHERE id = ?
    `;

    const [receiptResult] = await db.query(
      receiptQuery,
      [total_amount, payment_date, payment_method, status, notes, 
       amount_paid, total_amount_paid, balance, id]
    );
    
    if (receiptResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    // Delete existing authors and services (cascade will handle services)
    const deleteAuthorsQuery = 'DELETE FROM receipt_authors WHERE receipt_id = ?';
    await db.query(deleteAuthorsQuery, [id]);
    
    // Insert new authors and their services
    for (const author of authors) {
      // Insert author
      const authorQuery = `
        INSERT INTO receipt_authors 
        (receipt_id, author_name, total_amount)
        VALUES (?, ?, ?)
      `;
      
      const [authorResult] = await db.query(
        authorQuery,
        [id, author.author_name, author.total_amount]
      );
      
      const authorId = authorResult.insertId;
      
      // Insert services for this author
      for (const service of author.services) {
        const serviceQuery = `
          INSERT INTO receipt_services 
          (author_id, service_name, amount)
          VALUES (?, ?, ?)
        `;
        
        await db.query(
          serviceQuery,
          [authorId, service.service_name, service.amount]
        );
      }
    }
    
    // Delete existing past payments
    const deletePastPaymentsQuery = 'DELETE FROM receipt_past_payments WHERE receipt_id = ?';
    await db.query(deletePastPaymentsQuery, [id]);
    
    // Insert new past payments if they exist
    if (past_payments && past_payments.length > 0) {
      for (const payment of past_payments) {
        const pastPaymentQuery = `
          INSERT INTO receipt_past_payments 
          (receipt_id, payment_date, amount, receipt_number)
          VALUES (?, ?, ?, ?)
        `;
        
        await db.query(
          pastPaymentQuery,
          [id, payment.date, payment.amount, payment.receipt_number]
        );
      }
    }
    
    await db.commit();
    
    res.json({ message: 'Receipt updated successfully' });
  } catch (err) {
    await db.rollback();
    res.status(500).json({ error: err.message });
  } 
});

// DELETE receipt (cascade will delete authors, services, and past payments)
router.delete('/receipts/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const query = 'DELETE FROM receipts WHERE id = ?';
    const [results] = await db.query(query, [id]);
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    res.json({ message: 'Receipt deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// PATCH endpoint to update payment amount and recalculate balance
router.patch('/receipts/:id/payment', async (req, res) => {
  const db = getDB();
  
  try {
    await db.beginTransaction();
    
    const { id } = req.params;
    const { amount_paid } = req.body;
    
    // Get the current receipt
    const receiptQuery = 'SELECT * FROM receipts WHERE id = ?';
    const [receiptResults] = await db.query(receiptQuery, [id]);
    
    if (receiptResults.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    const receipt = receiptResults[0];
    const totalAmount = parseFloat(receipt.total_amount) || 0;
    const amountPaidValue = parseFloat(amount_paid) || 0;
    const balance = Math.max(0, totalAmount - amountPaidValue);
    
    // Determine status based on payment
    let status = 'Pending';
    if (amountPaidValue >= totalAmount) {
      status = 'Paid';
    } else if (amountPaidValue > 0) {
      status = 'Partial';
    }
    
    // Update the receipt with new payment information
    const updateQuery = `
      UPDATE receipts 
      SET amount_paid = ?, balance = ?, status = ?
      WHERE id = ?
    `;
    
    const [updateResult] = await db.query(
      updateQuery,
      [amountPaidValue, balance, status, id]
    );
    
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    await db.commit();
    
    res.json({ 
      message: 'Payment updated successfully',
      amount_paid: amountPaidValue,
      balance: balance,
      status: status
    });
  } catch (err) {
    await db.rollback();
    res.status(500).json({ error: err.message });
  } 
});







// QA Analytics Endpoint
router.get("/qa/analytics", async (req, res) => {
  const db = getDB();
  
  try {
    // Get counts
    const [[transferCount]] = await db.query("SELECT COUNT(*) as count FROM qa_transfer_calls");
    const [[nonTransferCount]] = await db.query("SELECT COUNT(*) as count FROM qa_non_transfer_calls");
    
    // Get average scores (only for transfer calls now)
    const [[transferAvg]] = await db.query("SELECT AVG(score) as avg FROM qa_transfer_calls WHERE score IS NOT NULL");
    
    // Note: nonTransferAvg is no longer applicable since non-transfer calls don't have scores
    
    // Get agent performance - FIXED SQL syntax (removed NULLS LAST)
    const [agentPerformance] = await db.query(`
      SELECT 
        Agent, 
        COUNT(*) as total_calls,
        AVG(CASE WHEN source = 'transfer' THEN score ELSE NULL END) as avg_score,
        SUM(CASE WHEN source = 'transfer' THEN 1 ELSE 0 END) as transfer_count,
        SUM(CASE WHEN source = 'nontransfer' THEN 1 ELSE 0 END) as nontransfer_count
      FROM (
        SELECT Agent, score, 'transfer' as source FROM qa_transfer_calls
        UNION ALL
        SELECT Agent, NULL as score, 'nontransfer' as source FROM qa_non_transfer_calls
      ) as combined
      GROUP BY Agent
      ORDER BY avg_score DESC
    `);
    
    // Get compliance metrics - UPDATED for simplified non-transfer
    const complianceData = await Promise.all([
      // Script Followed - Transfer
      db.query("SELECT SUM(CASE WHEN followed_script = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      // Script Followed - Non-Transfer
      db.query("SELECT SUM(CASE WHEN followed_script = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_non_transfer_calls"),
      // 2+ Questions Asked - Transfer (non-transfer doesn't have this)
      db.query("SELECT SUM(CASE WHEN asked_2_questions = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      // Engaged with Author - Transfer (non-transfer doesn't have this)
      db.query("SELECT SUM(CASE WHEN engaged_with_author = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      // Handled Objection - Transfer (non-transfer doesn't have this)
      db.query("SELECT SUM(CASE WHEN handled_objection = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      // Author Aware Transfer - Transfer (non-transfer doesn't have this)
      db.query("SELECT SUM(CASE WHEN author_aware_transfer = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
    ]);
    
    const analytics = {
      transferCount: transferCount.count,
      nonTransferCount: nonTransferCount.count,
      totalCalls: transferCount.count + nonTransferCount.count,
      transferAvgScore: transferAvg.avg || 0,
      nonTransferAvgScore: 0, // Non-transfer no longer has scores
      agentPerformance,
      complianceData: [
        {
          name: 'Script Followed',
          transfer: complianceData[0][0][0].count,
          nonTransfer: complianceData[1][0][0].count
        },
        {
          name: '2+ Questions Asked',
          transfer: complianceData[2][0][0].count,
          nonTransfer: 0 // Non-transfer doesn't have this field
        },
        {
          name: 'Engaged with Author',
          transfer: complianceData[3][0][0].count,
          nonTransfer: 0 // Non-transfer doesn't have this field
        },
        {
          name: 'Handled Objection',
          transfer: complianceData[4][0][0].count,
          nonTransfer: 0 // Non-transfer doesn't have this field
        },
        {
          name: 'Author Aware Transfer',
          transfer: complianceData[5][0][0].count,
          nonTransfer: 0 // Non-transfer doesn't have this field
        }
      ]
    };
    
    res.json(analytics);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Migration endpoint to add amount_paid and balance to existing receipts
router.post('/migrate-receipts-balance', async (req, res) => {
  const db = getDB();
  
  try {
    await db.beginTransaction();
    
    // Get all receipts
    const receiptsQuery = 'SELECT * FROM receipts';
    const [receipts] = await db.query(receiptsQuery);
    
    for (const receipt of receipts) {
      const totalAmount = parseFloat(receipt.total_amount) || 0;
      let amountPaid = 0;
      let balance = totalAmount;
      
      // Set amount_paid based on status for existing receipts
      if (receipt.status === 'Paid') {
        amountPaid = totalAmount;
        balance = 0;
      } else if (receipt.status === 'Partial') {
        // For partial payments, we'll set amount_paid to half of total
        // You might want to adjust this logic based on your actual data
        amountPaid = totalAmount / 2;
        balance = totalAmount / 2;
      }
      
      // Update the receipt with amount_paid and balance
      const updateQuery = 'UPDATE receipts SET amount_paid = ?, balance = ? WHERE id = ?';
      await db.query(updateQuery, [amountPaid, balance, receipt.id]);
    }
    
    await db.commit();
    
    res.json({ message: 'Receipts migrated successfully with balance information' });
  } catch (err) {
    await db.rollback();
    res.status(500).json({ error: err.message });
  } 
});


// Save purchase order
router.post("/purchase-orders", async (req, res) => {
  const db = getDB();
  const { vendor, address, phone, poNumber, date, items, shipping, handling, tax , bookstore, zipcode} = req.body;

  try {
    // Insert into purchase_orders table
    const [result] = await db.query(
      `INSERT INTO purchase_orders 
        (vendor, address, phone, po_number, date, shipping, handling, tax, bookstore, zipcode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor, address, phone, poNumber, date, shipping, handling, tax, bookstore, zipcode]
    );

    const orderId = result.insertId;

    // Insert items with proper status handling
    for (const item of items) {
      let statusValue = item.status;
      if (statusValue === "" || statusValue === undefined) {
        statusValue = null;
      }
      
      await db.query(
        `INSERT INTO purchase_order_items 
          (order_id, author, book, qty, price, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.author, item.book, item.qty, item.price, statusValue]
      );
    }
    res.status(200).json({ message: "Purchase order saved", orderId });
  } catch (err) {
    console.error("Error saving purchase order:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/purchase-orders", async (req, res) => {
  const db = getDB();
  
  try {
    // Get all purchase orders with their items
    const [orders] = await db.query(`
      SELECT 
        po.id, 
        po.vendor, 
        po.address, 
        po.phone, 
        po.po_number as poNumber, 
        po.date, 
        po.shipping, 
        po.handling, 
        po.tax,
        po.bookstore,
        po.zipcode,
        po.created_at,
        poi.id as item_id,
        poi.author,
        poi.book,
        poi.qty,
        poi.price,
        poi.status
      FROM purchase_orders po
      LEFT JOIN purchase_order_items poi ON po.id = poi.order_id
      ORDER BY po.created_at DESC
    `);

    // Group items by order
    const ordersMap = new Map();
    
    orders.forEach(row => {
      if (!ordersMap.has(row.id)) {
        ordersMap.set(row.id, {
          _id: row.id,
          vendor: row.vendor,
          address: row.address,
          phone: row.phone,
          poNumber: row.poNumber,
          bookstore: row.bookstore,
          zipcode: row.zipcode,
          date: row.date,
          shipping: parseFloat(row.shipping) || 0,
          handling: parseFloat(row.handling) || 0,
          tax: parseFloat(row.tax) || 0,
          createdAt: row.created_at,
          items: []
        });
      }
      
      // Add item if it exists (LEFT JOIN might return null values)
      if (row.item_id) {
        ordersMap.get(row.id).items.push({
          author: row.author,
          book: row.book,
          qty: parseInt(row.qty) || 0,
          price: parseFloat(row.price) || 0,
          status: row.status
        });
      }
    });
    
    // Convert map to array
    const ordersArray = Array.from(ordersMap.values());
    
    res.status(200).json(ordersArray);
  } catch (err) {
    console.error("Error fetching purchase orders:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update the other routes similarly (get by ID, search, update, delete)
// Make sure to include status in all the item queries and inserts/updates

// router.put("/purchase-orders/:id", async (req, res) => {
//   const db = getDB();
//   const orderId = req.params.id;
//   const { vendor, address, phone, poNumber, date, items, shipping, handling, tax,bookstore, zipcode } = req.body;
//   console.log("all req.body", req.body);

//   try {
//     // First check if the order exists
//     const [checkRows] = await db.query(
//       "SELECT id FROM purchase_orders WHERE id = ?",
//       [orderId]
//     );
    
//     if (checkRows.length === 0) {
//       return res.status(404).json({ error: "Purchase order not found" });
//     }

//     // Update the purchase order
//     await db.query(
//       `UPDATE purchase_orders 
//        SET vendor = ?, address = ?, phone = ?, po_number = ?, date = ?, 
//            shipping = ?, handling = ?, tax = ?, bookstore = ?, zipcode = ?
//        WHERE id = ?`,
//       [vendor, address, phone, poNumber, date, shipping, handling, tax, bookstore, zipcode, orderId]
//     );

//     // Delete existing items
//     await db.query(
//       "DELETE FROM purchase_order_items WHERE order_id = ?",
//       [orderId]
//     );

//     // Insert updated items
//     for (const item of items) {

//       const statusValue = item.status === "" ? null : item.status;
//       await db.query(
//         `INSERT INTO purchase_order_items 
//           (order_id, author, book, qty, price, status) 
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [orderId, item.author, item.book, item.qty, item.price, statusValue]
//       );
//     }

//     res.status(200).json({ message: "Purchase order updated", orderId });
//   } catch (err) {
//     console.error("Error updating purchase order:", err);
//     res.status(500).json({ error: "Database error" });
//   }
// });

router.put("/purchase-orders/:id", async (req, res) => {
  const db = getDB();
  const orderId = req.params.id;
  const { vendor, address, phone, poNumber, date, items, shipping, handling, tax, bookstore, zipcode } = req.body;
  console.log("all req.body", req.body);

  try {
    // First check if the order exists
    const [checkRows] = await db.query(
      "SELECT id FROM purchase_orders WHERE id = ?",
      [orderId]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    // Update the purchase order
    await db.query(
      `UPDATE purchase_orders 
       SET vendor = ?, address = ?, phone = ?, po_number = ?, date = ?, 
           shipping = ?, handling = ?, tax = ?, bookstore = ?, zipcode = ?
       WHERE id = ?`,
      [vendor, address, phone, poNumber, date, shipping, handling, tax, bookstore || null, zipcode || null, orderId]
    );

    // Delete existing items
    await db.query(
      "DELETE FROM purchase_order_items WHERE order_id = ?",
      [orderId]
    );

    // Insert updated items - PROPERLY handle status conversion
    for (const item of items) {
      // Handle status: empty string, null, or undefined should become null
      let statusValue = item.status;
      if (statusValue === "" || statusValue === undefined) {
        statusValue = null;
      }
      
      console.log(`Inserting item:`, { 
        author: item.author, 
        book: item.book, 
        qty: item.qty, 
        price: item.price, 
        status: statusValue 
      });
      
      await db.query(
        `INSERT INTO purchase_order_items 
          (order_id, author, book, qty, price, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.author, item.book, item.qty, item.price, statusValue]
      );
    }

    res.status(200).json({ message: "Purchase order updated", orderId });
  } catch (err) {
    console.error("Error updating purchase order:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/purchase-orders/:id", async (req, res) => {
  const db = getDB();
  const orderId = req.params.id;
  
  try {
    // Get the purchase order
    const [orderRows] = await db.query(`
      SELECT 
        id, 
        vendor, 
        address, 
        phone, 
        po_number as poNumber, 
        date, 
        shipping, 
        handling, 
        tax,
        bookstore,
        zipcode,
        created_at
      FROM purchase_orders 
      WHERE id = ?
    `, [orderId]);
    
    if (orderRows.length === 0) {
      return res.status(404).json({ error: "Purchase order not found" });
    }
    
    // Get the items for this order
    const [itemRows] = await db.query(`
      SELECT 
        id,
        author,
        book,
        qty,
        price,
        status
      FROM purchase_order_items 
      WHERE order_id = ?
    `, [orderId]);
    
    // Combine order and items
    const order = {
      _id: orderRows[0].id,
      vendor: orderRows[0].vendor,
      address: orderRows[0].address,
      phone: orderRows[0].phone,
      poNumber: orderRows[0].poNumber,
      bookstore: orderRows[0].bookstore,
      zipcode: orderRows[0].zipcode,
      date: orderRows[0].date,
      shipping: parseFloat(orderRows[0].shipping) || 0,
      handling: parseFloat(orderRows[0].handling) || 0,
      tax: parseFloat(orderRows[0].tax) || 0,
      createdAt: orderRows[0].created_at,
      items: itemRows.map(item => ({
        author: item.author,
        book: item.book,
        qty: parseInt(item.qty) || 0,
        price: parseFloat(item.price) || 0,
        status: item.status
      }))
    };
    
    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching purchase order:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/purchase-orders/search/:query", async (req, res) => {
  const db = getDB();
  const searchQuery = `%${req.params.query}%`;
  
  try {
    // Search purchase orders by vendor or PO number
    const [orders] = await db.query(`
      SELECT 
        po.id, 
        po.vendor, 
        po.address, 
        po.phone, 
        po.po_number as poNumber, 
        po.date, 
        po.shipping, 
        po.handling, 
        po.tax,
        po.bookstore,
        po.zipcode,
        po.created_at,
        poi.id as item_id,
        poi.author,
        poi.book,
        poi.qty,
        poi.price,
        poi.status
      FROM purchase_orders po
      LEFT JOIN purchase_order_items poi ON po.id = poi.order_id
      WHERE po.vendor LIKE ? OR po.po_number LIKE ?
      ORDER BY po.created_at DESC
    `, [searchQuery, searchQuery]);

    // Group items by order
    const ordersMap = new Map();
    
    orders.forEach(row => {
      if (!ordersMap.has(row.id)) {
        ordersMap.set(row.id, {
          _id: row.id,
          vendor: row.vendor,
          address: row.address,
          phone: row.phone,
          poNumber: row.poNumber,
          bookstore: row.bookstore,
          zipcode: row.zipcode,
          date: row.date,
          shipping: parseFloat(row.shipping) || 0,
          handling: parseFloat(row.handling) || 0,
          tax: parseFloat(row.tax) || 0,
          createdAt: row.created_at,
          items: []
        });
      }
      
      // Add item if it exists
      if (row.item_id) {
        ordersMap.get(row.id).items.push({
          author: row.author,
          book: row.book,
          qty: parseInt(row.qty) || 0,
          price: parseFloat(row.price) || 0,
          status: row.status
        });
      }
    });
    
    // Convert map to array
    const ordersArray = Array.from(ordersMap.values());
    
    res.status(200).json(ordersArray);
  } catch (err) {
    console.error("Error searching purchase orders:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/purchase-orders/:id", async (req, res) => {
  const db = getDB();
  const orderId = req.params.id;
  
  try {
    // First check if the order exists
    const [checkRows] = await db.query(
      "SELECT id FROM purchase_orders WHERE id = ?",
      [orderId]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({ error: "Purchase order not found" });
    }

    // Delete items first (due to foreign key constraint)
    await db.query(
      "DELETE FROM purchase_order_items WHERE order_id = ?",
      [orderId]
    );

    // Delete the order
    await db.query(
      "DELETE FROM purchase_orders WHERE id = ?",
      [orderId]
    );

    res.status(200).json({ message: "Purchase order deleted" });
  } catch (err) {
    console.error("Error deleting purchase order:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// Add these routes to your existing backend

// Get all transfer calls - UPDATED for call_date filtering
router.get("/qa/transfer", async (req, res) => {
  const db = getDB();
  const { startDate, endDate, agent, qa, minScore, maxScore } = req.query;
  
  try {
    let query = "SELECT * FROM qa_transfer_calls WHERE 1=1";
    const params = [];
    
    if (startDate) {
      query += " AND (call_date >= ? OR (call_date IS NULL AND DATE(created_at) >= ?))";
      params.push(startDate, startDate);
    }
    
    if (endDate) {
      query += " AND (call_date <= ? OR (call_date IS NULL AND DATE(created_at) <= ?))";
      params.push(endDate, endDate);
    }
    
    if (agent) {
      query += " AND Agent = ?";
      params.push(agent);
    }
    
    if (qa) {
      query += " AND qa_name = ?";
      params.push(qa);
    }
    
    if (minScore) {
      query += " AND score >= ?";
      params.push(minScore);
    }
    
    if (maxScore) {
      query += " AND score <= ?";
      params.push(maxScore);
    }
    
    query += " ORDER BY COALESCE(call_date, created_at) DESC";
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching transfer calls:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all non-transfer calls - UPDATED (removed score filtering for non-transfer)
router.get("/qa/non-transfer", async (req, res) => {
  const db = getDB();
  const { startDate, endDate, agent, qa } = req.query; // Removed minScore, maxScore
  
  try {
    let query = "SELECT * FROM qa_non_transfer_calls WHERE 1=1";
    const params = [];
    
    if (startDate) {
      query += " AND call_date >= ?";
      params.push(startDate);
    }
    
    if (endDate) {
      query += " AND call_date <= ?";
      params.push(endDate);
    }
    
    if (agent) {
      query += " AND Agent = ?";
      params.push(agent);
    }
    
    if (qa) {
      query += " AND qa_name = ?";
      params.push(qa);
    }
    
    // Removed score filtering for non-transfer calls
    
    query += " ORDER BY call_date DESC";
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching non-transfer calls:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add new transfer call - UPDATED with call_date
router.post("/qa/transfer", async (req, res) => {
  const db = getDB();
  const {
    call_date, // Added this
    Agent,
    phone_number,
    // call_recording_link, // Removed since frontend doesn't use it
    energy_good,
    followed_script,
    asked_2_questions,
    engaged_with_author,
    handled_objection,
    author_aware_transfer,
    score,
    notes,
    qa_name
  } = req.body;
  
  try {
    const [result] = await db.query(
      `INSERT INTO qa_transfer_calls 
       (call_date, Agent, phone_number, energy_good, followed_script, 
        asked_2_questions, engaged_with_author, handled_objection, 
        author_aware_transfer, score, notes, qa_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        call_date, // Added this
        Agent, 
        phone_number, 
        // call_recording_link, // Removed
        energy_good, 
        followed_script,
        asked_2_questions, 
        engaged_with_author, 
        handled_objection,
        author_aware_transfer, 
        score, 
        notes, 
        qa_name
      ]
    );
    
    res.status(201).json({ 
      message: "Transfer call added successfully", 
      id: result.insertId 
    });
  } catch (err) {
    console.error("Error adding transfer call:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add new non-transfer call - UPDATED (simplified without unnecessary fields)
router.post("/qa/non-transfer", async (req, res) => {
  const db = getDB();
  const {
    call_date,
    Agent,
    phone_number,
    // call_recording_link, // Removed
    followed_script,
    // Removed: asked_2_questions, engaged_with_author, handled_objection, author_aware_transfer, score
    notes,
    qa_name
  } = req.body;
  
  try {
    const [result] = await db.query(
      `INSERT INTO qa_non_transfer_calls 
       (call_date, Agent, phone_number, followed_script, notes, qa_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        call_date, 
        Agent, 
        phone_number, 
        // call_recording_link, // Removed
        followed_script,
        // Removed fields
        notes, 
        qa_name
      ]
    );
    
    res.status(201).json({ 
      message: "Non-transfer call added successfully", 
      id: result.insertId 
    });
  } catch (err) {
    console.error("Error adding non-transfer call:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get unique agents
router.get("/qa/agents", async (req, res) => {
  const db = getDB();
  
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT Agent FROM qa_transfer_calls 
       UNION 
       SELECT DISTINCT Agent FROM qa_non_transfer_calls 
       ORDER BY Agent`
    );
    
    res.json(rows.map(row => row.Agent));
  } catch (err) {
    console.error("Error fetching agents:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get unique QA names
router.get("/qa/qas", async (req, res) => {
  const db = getDB();
  
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT qa_name FROM qa_transfer_calls WHERE qa_name IS NOT NULL
       UNION 
       SELECT DISTINCT qa_name FROM qa_non_transfer_calls WHERE qa_name IS NOT NULL
       ORDER BY qa_name`
    );
    
    res.json(rows.map(row => row.qa_name));
  } catch (err) {
    console.error("Error fetching QA names:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get analytics summary - UPDATED to handle simplified non-transfer data
router.get("/qa/analytics", async (req, res) => {
  const db = getDB();
  
  try {
    // Get counts
    const [[transferCount]] = await db.query("SELECT COUNT(*) as count FROM qa_transfer_calls");
    const [[nonTransferCount]] = await db.query("SELECT COUNT(*) as count FROM qa_non_transfer_calls");
    
    // Get average scores (only for transfer calls now)
    const [[transferAvg]] = await db.query("SELECT AVG(score) as avg FROM qa_transfer_calls WHERE score IS NOT NULL");
    
    // Note: nonTransferAvg is no longer applicable since non-transfer calls don't have scores
    
    // Get agent performance - UPDATED
    const [agentPerformance] = await db.query(`
      SELECT 
        Agent, 
        COUNT(*) as total_calls,
        AVG(CASE WHEN source = 'transfer' THEN score ELSE NULL END) as avg_score,
        SUM(CASE WHEN source = 'transfer' THEN 1 ELSE 0 END) as transfer_count,
        SUM(CASE WHEN source = 'nontransfer' THEN 1 ELSE 0 END) as nontransfer_count
      FROM (
        SELECT Agent, score, 'transfer' as source FROM qa_transfer_calls
        UNION ALL
        SELECT Agent, NULL as score, 'nontransfer' as source FROM qa_non_transfer_calls
      ) as combined
      GROUP BY Agent
      ORDER BY avg_score DESC NULLS LAST
    `);
    
    // Get compliance metrics - UPDATED for simplified non-transfer
    const complianceData = await Promise.all([
      // Script Followed - Transfer
      db.query("SELECT SUM(CASE WHEN followed_script = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      // Script Followed - Non-Transfer
      db.query("SELECT SUM(CASE WHEN followed_script = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_non_transfer_calls"),
      // 2+ Questions Asked - Transfer (non-transfer doesn't have this)
      db.query("SELECT SUM(CASE WHEN asked_2_questions = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      // Engaged with Author - Transfer (non-transfer doesn't have this)
      db.query("SELECT SUM(CASE WHEN engaged_with_author = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      // Handled Objection - Transfer (non-transfer doesn't have this)
      db.query("SELECT SUM(CASE WHEN handled_objection = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      // Author Aware Transfer - Transfer (non-transfer doesn't have this)
      db.query("SELECT SUM(CASE WHEN author_aware_transfer = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
    ]);
    
    const analytics = {
      transferCount: transferCount.count,
      nonTransferCount: nonTransferCount.count,
      totalCalls: transferCount.count + nonTransferCount.count,
      transferAvgScore: transferAvg.avg || 0,
      nonTransferAvgScore: 0, // Non-transfer no longer has scores
      agentPerformance,
      complianceData: [
        {
          name: 'Script Followed',
          transfer: complianceData[0][0][0].count,
          nonTransfer: complianceData[1][0][0].count
        },
        {
          name: '2+ Questions Asked',
          transfer: complianceData[2][0][0].count,
          nonTransfer: 0 // Non-transfer doesn't have this field
        },
        {
          name: 'Engaged with Author',
          transfer: complianceData[3][0][0].count,
          nonTransfer: 0 // Non-transfer doesn't have this field
        },
        {
          name: 'Handled Objection',
          transfer: complianceData[4][0][0].count,
          nonTransfer: 0 // Non-transfer doesn't have this field
        },
        {
          name: 'Author Aware Transfer',
          transfer: complianceData[5][0][0].count,
          nonTransfer: 0 // Non-transfer doesn't have this field
        }
      ]
    };
    
    res.json(analytics);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete transfer call
router.delete("/qa/transfer/:id", async (req, res) => {
  const db = getDB();
  const callId = req.params.id;
  
  try {
    // First check if the call exists
    const [checkRows] = await db.query(
      "SELECT id FROM qa_transfer_calls WHERE id = ?",
      [callId]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({ error: "Transfer call not found" });
    }

    // Delete the call
    await db.query(
      "DELETE FROM qa_transfer_calls WHERE id = ?",
      [callId]
    );

    res.status(200).json({ message: "Transfer call deleted successfully" });
  } catch (err) {
    console.error("Error deleting transfer call:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete non-transfer call
router.delete("/qa/non-transfer/:id", async (req, res) => {
  const db = getDB();
  const callId = req.params.id;
  
  try {
    // First check if the call exists
    const [checkRows] = await db.query(
      "SELECT id FROM qa_non_transfer_calls WHERE id = ?",
      [callId]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({ error: "Non-transfer call not found" });
    }

    // Delete the call
    await db.query(
      "DELETE FROM qa_non_transfer_calls WHERE id = ?",
      [callId]
    );

    res.status(200).json({ message: "Non-transfer call deleted successfully" });
  } catch (err) {
    console.error("Error deleting non-transfer call:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add these endpoints to your existing backend

// Update transfer call
router.put("/qa/transfer/:id", async (req, res) => {
  const db = getDB();
  const callId = req.params.id;
  const {
    call_date,
    Agent,
    phone_number,
    energy_good,
    followed_script,
    asked_2_questions,
    engaged_with_author,
    handled_objection,
    author_aware_transfer,
    score,
    notes,
    qa_name
  } = req.body;
  
  try {
    // First check if the call exists
    const [checkRows] = await db.query(
      "SELECT id FROM qa_transfer_calls WHERE id = ?",
      [callId]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({ error: "Transfer call not found" });
    }

    // Update the call
    await db.query(
      `UPDATE qa_transfer_calls 
       SET call_date = ?, Agent = ?, phone_number = ?, energy_good = ?, 
           followed_script = ?, asked_2_questions = ?, engaged_with_author = ?,
           handled_objection = ?, author_aware_transfer = ?, score = ?, 
           notes = ?, qa_name = ?
       WHERE id = ?`,
      [
        call_date,
        Agent, 
        phone_number, 
        energy_good, 
        followed_script,
        asked_2_questions, 
        engaged_with_author, 
        handled_objection,
        author_aware_transfer, 
        score, 
        notes, 
        qa_name,
        callId
      ]
    );
    
    res.status(200).json({ 
      message: "Transfer call updated successfully", 
      id: callId 
    });
  } catch (err) {
    console.error("Error updating transfer call:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update non-transfer call
router.put("/qa/non-transfer/:id", async (req, res) => {
  const db = getDB();
  const callId = req.params.id;
  const {
    call_date,
    Agent,
    phone_number,
    followed_script,
    notes,
    qa_name
  } = req.body;
  
  try {
    // First check if the call exists
    const [checkRows] = await db.query(
      "SELECT id FROM qa_non_transfer_calls WHERE id = ?",
      [callId]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({ error: "Non-transfer call not found" });
    }

    // Update the call
    await db.query(
      `UPDATE qa_non_transfer_calls 
       SET call_date = ?, Agent = ?, phone_number = ?, 
           followed_script = ?, notes = ?, qa_name = ?
       WHERE id = ?`,
      [
        call_date, 
        Agent, 
        phone_number, 
        followed_script,
        notes, 
        qa_name,
        callId
      ]
    );
    
    res.status(200).json({ 
      message: "Non-transfer call updated successfully", 
      id: callId 
    });
  } catch (err) {
    console.error("Error updating non-transfer call:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Enhanced analytics endpoint to include transfer rates
router.get("/qa/analytics", async (req, res) => {
  const db = getDB();
  
  try {
    // Get counts
    const [[transferCount]] = await db.query("SELECT COUNT(*) as count FROM qa_transfer_calls");
    const [[nonTransferCount]] = await db.query("SELECT COUNT(*) as count FROM qa_non_transfer_calls");
    
    // Get average scores (only for transfer calls)
    const [[transferAvg]] = await db.query("SELECT AVG(score) as avg FROM qa_transfer_calls WHERE score IS NOT NULL");
    
    // Get agent performance with transfer rates
    const [agentPerformance] = await db.query(`
      SELECT 
        Agent, 
        COUNT(*) as total_calls,
        AVG(CASE WHEN source = 'transfer' THEN score ELSE NULL END) as avg_score,
        SUM(CASE WHEN source = 'transfer' THEN 1 ELSE 0 END) as transfer_count,
        SUM(CASE WHEN source = 'nontransfer' THEN 1 ELSE 0 END) as nontransfer_count
      FROM (
        SELECT Agent, score, 'transfer' as source FROM qa_transfer_calls
        UNION ALL
        SELECT Agent, NULL as score, 'nontransfer' as source FROM qa_non_transfer_calls
      ) as combined
      GROUP BY Agent
      ORDER BY avg_score DESC
    `);
    
    // Calculate transfer rates for each agent
    const agentsWithTransferRate = agentPerformance.map(agent => {
      const transferRate = agent.total_calls > 0 
        ? (agent.transfer_count / agent.total_calls) * 100 
        : 0;
      
      return {
        ...agent,
        transfer_rate: transferRate
      };
    });
    
    // Get best openers (highest transfer rate)
    const bestOpeners = [...agentsWithTransferRate]
      .filter(agent => agent.total_calls >= 5)
      .sort((a, b) => b.transfer_rate - a.transfer_rate)
      .slice(0, 10);
    
    // Get compliance metrics
    const complianceData = await Promise.all([
      db.query("SELECT SUM(CASE WHEN followed_script = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      db.query("SELECT SUM(CASE WHEN followed_script = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_non_transfer_calls"),
      db.query("SELECT SUM(CASE WHEN asked_2_questions = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      db.query("SELECT SUM(CASE WHEN engaged_with_author = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      db.query("SELECT SUM(CASE WHEN handled_objection = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
      db.query("SELECT SUM(CASE WHEN author_aware_transfer = 'Yes' THEN 1 ELSE 0 END) as count FROM qa_transfer_calls"),
    ]);
    
    const analytics = {
      transferCount: transferCount.count,
      nonTransferCount: nonTransferCount.count,
      totalCalls: transferCount.count + nonTransferCount.count,
      transferAvgScore: transferAvg.avg || 0,
      nonTransferAvgScore: 0,
      agentPerformance: agentsWithTransferRate,
      bestOpeners,
      complianceData: [
        {
          name: 'Script Followed',
          transfer: complianceData[0][0][0].count,
          nonTransfer: complianceData[1][0][0].count
        },
        {
          name: '2+ Questions Asked',
          transfer: complianceData[2][0][0].count,
          nonTransfer: 0
        },
        {
          name: 'Engaged with Author',
          transfer: complianceData[3][0][0].count,
          nonTransfer: 0
        },
        {
          name: 'Handled Objection',
          transfer: complianceData[4][0][0].count,
          nonTransfer: 0
        },
        {
          name: 'Author Aware Transfer',
          transfer: complianceData[5][0][0].count,
          nonTransfer: 0
        }
      ]
    };
    
    res.json(analytics);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all reminders with filters (FOR CURRENT USER ONLY)

router.get("/reminders", async (req, res) => {
  const db = getDB();
  const { status, priority, category, assigned_to, search, sort_by = 'due_date', sort_order = 'asc' } = req.query;
  
  // Authentication check
  const agentId = req.session.userId;
  if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    let query = "SELECT * FROM reminders WHERE created_by = ?";
    const params = [agentId];
    
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    
    if (priority) {
      query += " AND priority = ?";
      params.push(priority);
    }
    
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    
    if (assigned_to) {
      query += " AND assigned_to = ?";
      params.push(assigned_to);
    }
    
    if (search) {
      query += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Simple sorting
    query += ` ORDER BY ${sort_by} ${sort_order}`;
    
    const [reminders] = await db.query(query, params);
    
    // Parse JSON tags for each reminder with better error handling
    const formattedReminders = reminders.map(reminder => {
      let tagsArray = [];
      
      // Handle tags field carefully
      if (reminder.tags) {
        try {
          // If tags is already an array, use it directly
          if (Array.isArray(reminder.tags)) {
            tagsArray = reminder.tags;
          } 
          // If tags is a string, try to parse it
          else if (typeof reminder.tags === 'string') {
            const trimmedTags = reminder.tags.trim();
            if (trimmedTags) {
              // Check if it's already valid JSON
              if (trimmedTags.startsWith('[') || trimmedTags.startsWith('{')) {
                const parsed = JSON.parse(trimmedTags);
                tagsArray = Array.isArray(parsed) ? parsed : [];
              } else {
                // If it's just a plain string, wrap it in an array
                tagsArray = [trimmedTags];
              }
            }
          }
        } catch (err) {
          console.warn(`Error parsing tags for reminder ${reminder.id}:`, err.message);
          console.log('Tags value:', reminder.tags);
          tagsArray = [];
        }
      }
      
      return {
        ...reminder,
        tags: tagsArray
      };
    });
    
    res.json(formattedReminders);
  } catch (err) {
    console.error("Error fetching reminders:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Create a new reminder (FOR CURRENT USER ONLY)
router.post("/reminders", async (req, res) => {
  const db = getDB();
  const {
    title,
    description,
    due_date,
    priority = 'medium',
    status = 'pending',
    category,
    assigned_to,
    tags = [],
    is_recurring = false,
    recurrence_pattern,
    next_occurrence,
    notes
  } = req.body;
  
  // Authentication check
  const agentId = req.session.userId;
  if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    // Ensure tags is properly formatted as JSON string
    let tagsJson = '[]';
    if (tags && Array.isArray(tags)) {
      tagsJson = JSON.stringify(tags);
    } else if (tags && typeof tags === 'string') {
      // If it's a string, try to parse it first to ensure it's valid JSON
      try {
        JSON.parse(tags);
        tagsJson = tags;
      } catch {
        // If not valid JSON, wrap it in an array
        tagsJson = JSON.stringify([tags]);
      }
    }
    
    // Format due_date for MySQL if provided
    let formattedDueDate = null;
    if (due_date) {
      try {
        const date = new Date(due_date);
        formattedDueDate = date.toISOString().slice(0, 19).replace('T', ' ');
      } catch (err) {
        console.error('Error formatting due_date:', err);
        // Keep original if can't parse
        formattedDueDate = due_date;
      }
    }
    
    // Format next_occurrence for MySQL if provided
    let formattedNextOccurrence = null;
    if (next_occurrence) {
      try {
        const date = new Date(next_occurrence);
        formattedNextOccurrence = date.toISOString().slice(0, 19).replace('T', ' ');
      } catch (err) {
        console.error('Error formatting next_occurrence:', err);
        formattedNextOccurrence = next_occurrence;
      }
    }
    
    const [result] = await db.query(
      `INSERT INTO reminders 
       (title, description, due_date, priority, status, category, 
        assigned_to, tags, created_by, is_recurring, recurrence_pattern, 
        next_occurrence, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        formattedDueDate,
        priority,
        status,
        category,
        assigned_to,
        tagsJson,
        agentId,
        is_recurring,
        recurrence_pattern,
        formattedNextOccurrence,
        notes
      ]
    );
    
    res.status(201).json({ 
      message: "Reminder created successfully", 
      id: result.insertId 
    });
  } catch (err) {
    console.error("Error creating reminder:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});


// Update a reminder (ONLY IF OWNED BY USER)
router.put("/reminders/:id", async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const {
    title,
    description,
    due_date,
    priority,
    status,
    category,
    assigned_to,
    tags,
    is_recurring,
    recurrence_pattern,
    next_occurrence,
    completed_at,
    notes
  } = req.body;
  
  // Authentication check
  const agentId = req.session.userId;
  if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    // First, check if the reminder exists and belongs to user
    const [existing] = await db.query(
      "SELECT * FROM reminders WHERE id = ? AND created_by = ?",
      [id, agentId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: "Reminder not found or access denied" });
    }
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    if (title !== undefined) {
      updateFields.push("title = ?");
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(description);
    }
    if (due_date !== undefined) {
      updateFields.push("due_date = ?");
      updateValues.push(due_date);
    }
    if (priority !== undefined) {
      updateFields.push("priority = ?");
      updateValues.push(priority);
    }
    if (status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(status);
    }
    if (category !== undefined) {
      updateFields.push("category = ?");
      updateValues.push(category);
    }
    if (assigned_to !== undefined) {
      updateFields.push("assigned_to = ?");
      updateValues.push(assigned_to);
    }
    if (tags !== undefined) {
      // Ensure tags is properly formatted as JSON string
      let tagsJson = '[]';
      if (tags && Array.isArray(tags)) {
        tagsJson = JSON.stringify(tags);
      } else if (tags && typeof tags === 'string') {
        try {
          JSON.parse(tags);
          tagsJson = tags;
        } catch {
          tagsJson = JSON.stringify([tags]);
        }
      }
      updateFields.push("tags = ?");
      updateValues.push(tagsJson);
    }
    if (is_recurring !== undefined) {
      updateFields.push("is_recurring = ?");
      updateValues.push(is_recurring);
    }
    if (recurrence_pattern !== undefined) {
      updateFields.push("recurrence_pattern = ?");
      updateValues.push(recurrence_pattern);
    }
    if (next_occurrence !== undefined) {
      updateFields.push("next_occurrence = ?");
      updateValues.push(next_occurrence);
    }
    if (completed_at !== undefined) {
      // Convert ISO string to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
      let mysqlDateTime = null;
      if (completed_at) {
        try {
          const date = new Date(completed_at);
          // Format: YYYY-MM-DD HH:MM:SS
          mysqlDateTime = date.toISOString().slice(0, 19).replace('T', ' ');
        } catch (err) {
          console.error('Error formatting completed_at date:', err);
          // If invalid date, use current datetime
          mysqlDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        }
      }
      updateFields.push("completed_at = ?");
      updateValues.push(mysqlDateTime);
    }
    if (notes !== undefined) {
      updateFields.push("notes = ?");
      updateValues.push(notes);
    }
    
    // Add updated_at timestamp
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    
    // Add ID and agentId to values for WHERE clause
    updateValues.push(id, agentId);
    
    await db.query(
      `UPDATE reminders SET ${updateFields.join(", ")} WHERE id = ? AND created_by = ?`,
      updateValues
    );
    
    res.json({ message: "Reminder updated successfully" });
  } catch (err) {
    console.error("Error updating reminder:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});


// Delete a reminder (ONLY IF OWNED BY USER)
router.delete("/reminders/:id", async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  
  // Authentication check
  const agentId = req.session.userId;
  if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const [result] = await db.query(
      "DELETE FROM reminders WHERE id = ? AND created_by = ?",
      [id, agentId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reminder not found or access denied" });
    }
    
    res.json({ message: "Reminder deleted successfully" });
  } catch (err) {
    console.error("Error deleting reminder:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Get all notes (FOR CURRENT USER ONLY)
router.get("/notes", async (req, res) => {
  const db = getDB();
  const { category, is_pinned, search } = req.query;
  
  // Authentication check
  const agentId = req.session.userId;
  if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    let query = "SELECT * FROM notes WHERE created_by = ?";
    const params = [agentId];
    
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    
    if (is_pinned !== undefined) {
      query += " AND is_pinned = ?";
      params.push(is_pinned === 'true');
    }
    
    if (search) {
      query += " AND (title LIKE ? OR content LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += " ORDER BY is_pinned DESC, updated_at DESC";
    
    const [notes] = await db.query(query, params);
    
    // Parse JSON tags for each note with better error handling
    const formattedNotes = notes.map(note => {
      let tagsArray = [];
      
      // Handle tags field carefully
      if (note.tags) {
        try {
          // If tags is already an array, use it directly
          if (Array.isArray(note.tags)) {
            tagsArray = note.tags;
          } 
          // If tags is a string, try to parse it
          else if (typeof note.tags === 'string') {
            const trimmedTags = note.tags.trim();
            if (trimmedTags) {
              // Check if it's already valid JSON
              if (trimmedTags.startsWith('[') || trimmedTags.startsWith('{')) {
                const parsed = JSON.parse(trimmedTags);
                tagsArray = Array.isArray(parsed) ? parsed : [];
              } else {
                // If it's just a plain string, wrap it in an array
                tagsArray = [trimmedTags];
              }
            }
          }
        } catch (err) {
          console.warn(`Error parsing tags for note ${note.id}:`, err.message);
          console.log('Tags value:', note.tags);
          tagsArray = [];
        }
      }
      
      return {
        ...note,
        tags: tagsArray
      };
    });
    
    res.json(formattedNotes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Create a new note (FOR CURRENT USER ONLY)
router.post("/notes", async (req, res) => {
  const db = getDB();
  const {
    title,
    content,
    category,
    tags = [],
    is_pinned = false,
    color = '#ffffff'
  } = req.body;
  
  // Authentication check
  const agentId = req.session.userId;
  if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    // Ensure tags is properly formatted as JSON string
    let tagsJson = '[]';
    if (tags && Array.isArray(tags)) {
      tagsJson = JSON.stringify(tags);
    } else if (tags && typeof tags === 'string') {
      // If it's a string, try to parse it first to ensure it's valid JSON
      try {
        JSON.parse(tags);
        tagsJson = tags;
      } catch {
        // If not valid JSON, wrap it in an array
        tagsJson = JSON.stringify([tags]);
      }
    }
    
    const [result] = await db.query(
      `INSERT INTO notes 
       (title, content, category, tags, is_pinned, created_by, color)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        category,
        tagsJson,  // Use properly formatted JSON
        is_pinned,
        agentId,
        color
      ]
    );
    
    res.status(201).json({ 
      message: "Note created successfully", 
      id: result.insertId 
    });
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Update a note (ONLY IF OWNED BY USER)
router.put("/notes/:id", async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const {
    title,
    content,
    category,
    tags,
    is_pinned,
    color
  } = req.body;
  
  // Authentication check
  const agentId = req.session.userId;
  if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    // First, check if the note exists and belongs to user
    const [existing] = await db.query(
      "SELECT * FROM notes WHERE id = ? AND created_by = ?",
      [id, agentId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: "Note not found or access denied" });
    }
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    if (title !== undefined) {
      updateFields.push("title = ?");
      updateValues.push(title);
    }
    if (content !== undefined) {
      updateFields.push("content = ?");
      updateValues.push(content);
    }
    if (category !== undefined) {
      updateFields.push("category = ?");
      updateValues.push(category);
    }
    if (tags !== undefined) {
      // Ensure tags is properly formatted as JSON string
      let tagsJson = '[]';
      if (tags && Array.isArray(tags)) {
        tagsJson = JSON.stringify(tags);
      } else if (tags && typeof tags === 'string') {
        try {
          JSON.parse(tags);
          tagsJson = tags;
        } catch {
          tagsJson = JSON.stringify([tags]);
        }
      }
      updateFields.push("tags = ?");
      updateValues.push(tagsJson);
    }
    if (is_pinned !== undefined) {
      updateFields.push("is_pinned = ?");
      updateValues.push(is_pinned);
    }
    if (color !== undefined) {
      updateFields.push("color = ?");
      updateValues.push(color);
    }
    
    // Add updated_at timestamp
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    
    // Add ID and agentId to values for WHERE clause
    updateValues.push(id, agentId);
    
    await db.query(
      `UPDATE notes SET ${updateFields.join(", ")} WHERE id = ? AND created_by = ?`,
      updateValues
    );
    
    res.json({ message: "Note updated successfully" });
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Delete a note (ONLY IF OWNED BY USER)
router.delete("/notes/:id", async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  
  // Authentication check
  const agentId = req.session.userId;
  if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const [result] = await db.query(
      "DELETE FROM notes WHERE id = ? AND created_by = ?",
      [id, agentId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Note not found or access denied" });
    }
    
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Get dashboard statistics (FOR CURRENT USER ONLY)
router.get("/dashboard/stats", async (req, res) => {
  const db = getDB();
  
  // Authentication check
  const agentId = req.session.userId;
  if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    // Get all counts with separate simple queries
    const queries = [
      db.query("SELECT COUNT(*) as count FROM reminders WHERE created_by = ?", [agentId]),
      db.query("SELECT COUNT(*) as count FROM reminders WHERE created_by = ? AND status = 'pending'", [agentId]),
      db.query("SELECT COUNT(*) as count FROM reminders WHERE created_by = ? AND status = 'in_progress'", [agentId]),
      db.query("SELECT COUNT(*) as count FROM reminders WHERE created_by = ? AND status = 'completed'", [agentId]),
      db.query("SELECT COUNT(*) as count FROM reminders WHERE created_by = ? AND priority = 'high' AND status != 'completed'", [agentId]),
      db.query("SELECT COUNT(*) as count FROM reminders WHERE created_by = ? AND due_date < NOW() AND status NOT IN ('completed', 'cancelled')", [agentId]),
      db.query("SELECT COUNT(*) as count FROM notes WHERE created_by = ?", [agentId]),
      db.query("SELECT COUNT(*) as count FROM notes WHERE created_by = ? AND is_pinned = TRUE", [agentId]),
      db.query(`
        SELECT * FROM reminders 
        WHERE created_by = ? 
        AND due_date >= CURDATE()
        AND status NOT IN ('completed', 'cancelled')
        ORDER BY due_date ASC
        LIMIT 5
      `, [agentId])
    ];
    
    const results = await Promise.all(queries);
    
    res.json({
      reminder_stats: {
        total: results[0][0][0].count,
        pending: results[1][0][0].count,
        in_progress: results[2][0][0].count,
        completed: results[3][0][0].count,
        high_priority: results[4][0][0].count,
        overdue: results[5][0][0].count
      },
      note_stats: {
        total_notes: results[6][0][0].count,
        pinned_notes: results[7][0][0].count
      },
      upcoming_reminders: results[8][0]
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    
    // Return basic empty stats
    res.json({
      reminder_stats: {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        high_priority: 0,
        overdue: 0
      },
      note_stats: {
        total_notes: 0,
        pinned_notes: 0
      },
      upcoming_reminders: []
    });
  }
});

// Simple alternative to dashboard stats
router.get("/dashboard/stats/simple", async (req, res) => {
  const db = getDB();
  
  // Authentication check
  const agentId = req.session.userId;
  if (!agentId) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    // Simple counts for current user
    const [reminderCounts] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE status WHEN 'pending' THEN 1 END) as pending,
        COUNT(CASE status WHEN 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE status WHEN 'completed' THEN 1 END) as completed
      FROM reminders
      WHERE created_by = ?
    `, [agentId]);
    
    const [noteCounts] = await db.query(`
      SELECT 
        COUNT(*) as total_notes,
        COUNT(CASE is_pinned WHEN TRUE THEN 1 END) as pinned_notes
      FROM notes
      WHERE created_by = ?
    `, [agentId]);
    
    res.json({
      reminders: reminderCounts[0],
      notes: noteCounts[0]
    });
  } catch (err) {
    console.error("Error fetching simple stats:", err);
    
    // Fallback to even simpler queries
    try {
      const [totalReminders] = await db.query("SELECT COUNT(*) as total FROM reminders WHERE created_by = ?", [agentId]);
      const [totalNotes] = await db.query("SELECT COUNT(*) as total FROM notes WHERE created_by = ?", [agentId]);
      
      res.json({
        reminders: { total: totalReminders[0].total },
        notes: { total: totalNotes[0].total }
      });
    } catch (fallbackErr) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  }
});

module.exports = router;