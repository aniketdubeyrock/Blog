
const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getPostsByCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.route('/').post(protect, adminOnly, createCategory).get(getAllCategories);
router.get('/:slug/posts', getPostsByCategory);

module.exports = router;
