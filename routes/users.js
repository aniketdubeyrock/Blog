
const express = require('express');
const router = express.Router();
const {
  getAuthorProfile,
  getPostsByAuthor,
} = require('../controllers/userController');

router.get('/author/:authorId', getAuthorProfile);
router.get('/author/:authorId/posts', getPostsByAuthor);

module.exports = router;
