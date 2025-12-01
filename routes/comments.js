
const express = require('express');
const router = express.Router();
const {
  createComment,
  getCommentsForPost,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createComment);
router.get('/post/:postId', getCommentsForPost);
router.route('/:commentId').put(protect, updateComment).delete(protect, deleteComment);

module.exports = router;
