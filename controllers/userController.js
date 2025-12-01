
const User = require('../models/User');
const Post = require('../models/Post');

exports.getAuthorProfile = async (req, res) => {
  try {
    const author = await User.findById(req.params.authorId).select('username bio profilePicture socialLinks');
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    res.json(author);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getPostsByAuthor = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.authorId, status: 'published' })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
