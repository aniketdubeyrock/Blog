
const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  toggleLikePost,
  getFeaturedPosts,
  getPopularPosts,
  getRelatedPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createPost).get(getAllPosts);
router.get('/featured', getFeaturedPosts);
router.get('/popular', getPopularPosts);
router.get('/:slug', getPostBySlug);
router.route('/:postId').put(protect, updatePost).delete(protect, deletePost);
router.post('/:postId/like', protect, toggleLikePost);
router.get('/:postId/related', getRelatedPosts);

module.exports = router;
