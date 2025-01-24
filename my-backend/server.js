import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import pool from './db.js'; // Import the database connection

const app = express();

// Get the __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS setup to allow cross-origin requests from the frontend
app.use(cors());

// Parse JSON bodies for POST requests
app.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Get menus from the database
app.get('/api/menus', (req, res) => {
    pool.query('SELECT * FROM menus', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch menus' });
        }
        res.json(results);
    });
});

// Add a new menu item to the database
app.post('/api/menus', upload.single('file'), (req, res) => {
    const { name, description, price } = req.body;

    if (!req.file || !name || !description || !price) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newMenu = {
        name,
        description,
        price: parseFloat(price),
        image_url: `/uploads/${req.file.filename}`,
    };

    pool.query('INSERT INTO menus SET ?', newMenu, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to add menu' });
        }
        newMenu.id = result.insertId;
        res.status(201).json(newMenu);
    });
});

// Update an existing menu item in the database
app.put('/api/menus/:id', upload.single('file'), (req, res) => {
    const { name, description, price } = req.body;
    const menuId = req.params.id;
    const updateData = { name, description, price: parseFloat(price) };

    if (req.file) {
        updateData.image_url = `/uploads/${req.file.filename}`;
    }

    pool.query(
        'UPDATE menus SET ? WHERE id = ?',
        [updateData, menuId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update menu' });
            }
            res.status(200).json({ id: menuId, ...updateData });
        }
    );
});

// Delete a menu item from the database
app.delete('/api/menus/:id', (req, res) => {
    const menuId = req.params.id;

    pool.query('DELETE FROM menus WHERE id = ?', [menuId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete menu' });
        }
        res.status(200).json({ message: 'Menu deleted successfully' });
    });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
