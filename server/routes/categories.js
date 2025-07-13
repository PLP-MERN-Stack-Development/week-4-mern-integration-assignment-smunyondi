// categories.js - Express routes for blog categories

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Category = require('../models/Category');

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Create a new category
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json({ category });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id - Delete a category by ID (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only allow admin users to delete categories
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
