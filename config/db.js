const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'story_books'
          });
        console.log(`Connected to mongodb: ${con.connection.host}`);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = connectDb;