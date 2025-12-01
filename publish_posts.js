const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./models/Post');

dotenv.config();

const publishAllPosts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const result = await Post.updateMany(
            {},
            { $set: { status: 'published' } }
        );

        console.log(`Updated ${result.modifiedCount} posts to 'published' status.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

publishAllPosts();
