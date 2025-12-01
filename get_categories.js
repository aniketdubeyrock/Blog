const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

const showCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const categories = await Category.find();
        console.log('Available Categories:');
        categories.forEach(cat => {
            console.log(`- ${cat.name}: ${cat._id}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

showCategories();
