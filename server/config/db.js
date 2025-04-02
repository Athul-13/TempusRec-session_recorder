const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Ensure MONGODB_URI is defined
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the environment variables.');
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true, // Ensures the use of the new URL parser
            useUnifiedTopology: true, // Enables the MongoDB driver's new connection management engine
        });

        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit the application if the database connection fails
    }
};

module.exports = connectDB;