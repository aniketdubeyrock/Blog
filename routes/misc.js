
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { searchPosts, subscribeNewsletter, getAllTags } = require('../controllers/postController');

router.get('/search', searchPosts);
router.post('/subscribe', body('email', 'Please include a valid email').isEmail(), subscribeNewsletter);
router.get('/tags', getAllTags);

module.exports = router;
