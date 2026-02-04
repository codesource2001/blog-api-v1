module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    HOST: process.env.HOST || '0.0.0.0',
    PORT: process.env.PORT || 4001,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/blog-api',
}