const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const User = require('./models/User');
const Category = require('./models/Category');

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // 1. Create Admin User
        const adminEmail = 'admin@example.com';
        const adminPassword = 'adminpassword123';

        let adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            adminUser = new User({
                username: 'admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            await adminUser.save();
            console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
        } else {
            console.log('Admin user already exists.');
        }

        // 2. Create Categories
        const categories = [
            { name: 'Technology' },
            { name: 'Lifestyle' },
            { name: 'Education' }
        ];

        for (const cat of categories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                const newCat = new Category({
                    ...cat,
                    slug: slugify(cat.name, { lower: true, strict: true })
                });
                await newCat.save();
                console.log(`Category created: ${cat.name}`);
            }
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err);
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error(`Validation error for ${key}: ${err.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

seedDatabase();
