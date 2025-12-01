
const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.createComment = async (req, res) => {
  const { postId, content, parentComment } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = new Comment({
      post: postId,
      content,
      parentComment: parentComment || null,
      author: req.user.id,
    });

    const comment = await newComment.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getCommentsForPost = async (req, res) => {
    try {
      const comments = await Comment.find({ post: req.params.postId })
        .populate('author', 'username profilePicture')
        .sort({ createdAt: 1 });
  
      // Bonus: Create a nested structure
      const commentMap = {};
      const nestedComments = [];
  
      comments.forEach(comment => {
        commentMap[comment._id] = comment.toObject();
        commentMap[comment._id].children = [];
      });
  
      comments.forEach(comment => {
        if (comment.parentComment && commentMap[comment.parentComment]) {
          commentMap[comment.parentComment].children.push(commentMap[comment._id]);
        } else {
          nestedComments.push(commentMap[comment._id]);
        }
      });
  
      res.json(nestedComments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  };

exports.updateComment = async (req, res) => {
  const { content } = req.body;
  try {
    let comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this comment' });
    }

    comment.content = content;
    await comment.save();
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to delete this comment' });
    }

    // Bonus: Recursively delete child comments
    const deleteChildren = async (parentId) => {
      const children = await Comment.find({ parentComment: parentId });
      for (const child of children) {
        await deleteChildren(child._id);
        await child.deleteOne();
      }
    };
    await deleteChildren(req.params.commentId);
    await comment.deleteOne();

    res.json({ message: 'Comment and its replies deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
