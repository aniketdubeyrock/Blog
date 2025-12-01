
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const Subscription = require('../models/Subscription');
const { validationResult } = require('express-validator');
const slugify = require('slugify');

// Post Controllers
exports.createPost = async (req, res) => {
  const { title, content, excerpt, coverImage, category, tags, status, isFeatured } = req.body;

  if (!title || !content || !excerpt || !coverImage || !category) {
    return res.status(400).json({ message: 'Title, content, excerpt, coverImage, and category are required.' });
  }

  try {
    const slug = slugify(title, { lower: true, strict: true });

    // Check if slug exists
    const slugExists = await Post.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({ message: 'A post with this title already exists.' });
    }

    const newPost = new Post({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      status,
      isFeatured,
      author: req.user.id,
    });

    const post = await newPost.save();
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getAllPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { tag, category: categorySlug, status } = req.query;

  try {
    let query = {};

    // Filter by status (default to published if not specified, unless admin wants all)
    if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    if (tag) {
      query.tags = tag;
    }
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      } else {
        return res.json({ posts: [], totalPosts: 0, totalPages: 0, currentPage: 1 });
      }
    }

    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);
    const posts = await Post.find(query)
      .populate('author', 'username profilePicture')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      posts,
      totalPosts,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('author', 'username profilePicture bio socialLinks')
      .populate('category', 'name slug');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updatePost = async (req, res) => {
  const { title, content, excerpt, coverImage, category, tags, status, isFeatured } = req.body;
  try {
    let post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to update this post' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.excerpt = excerpt || post.excerpt;
    post.coverImage = coverImage || post.coverImage;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.status = status || post.status;
    post.isFeatured = isFeatured !== undefined ? isFeatured : post.isFeatured;

    post = await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    await Comment.deleteMany({ post: req.params.postId });
    await post.deleteOne();

    res.json({ message: 'Post and associated comments removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike
      post.likes.pull(userId);
    } else {
      // Like
      post.likes.push(userId);
    }
    post.likeCount = post.likes.length;
    await post.save();
    res.json({ likes: post.likes, likeCount: post.likeCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getFeaturedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isFeatured: true, status: 'published' })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getPopularPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'username profilePicture')
      .sort({ viewCount: -1, likeCount: -1 })
      .limit(5);
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getRelatedPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    const relatedPosts = await Post.find({
      tags: { $in: post.tags },
      _id: { $ne: post._id },
      status: 'published'
    })
      .populate('author', 'username profilePicture')
      .limit(3);
    res.json(relatedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Misc Controllers
exports.searchPosts = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }
  try {
    const posts = await Post.find({
      $text: { $search: q },
      status: 'published',
    }, {
      score: { $meta: 'textScore' }
    })
      .populate('author', 'username profilePicture')
      .sort({ score: { $meta: 'textScore' } });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.subscribeNewsletter = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  try {
    let subscription = await Subscription.findOne({ email });
    if (subscription) {
      return res.status(400).json({ message: 'Email is already subscribed' });
    }
    subscription = new Subscription({ email });
    await subscription.save();
    res.status(201).json({ message: 'Successfully subscribed to the newsletter' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Post.distinct('tags', { status: 'published' });
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
