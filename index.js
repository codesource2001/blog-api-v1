const app = require('./src/server');
const config = require('./src/config');
if (config.NODE_ENV === 'development') {
    require('dotenv').config();
}

const PORT = config.PORT
const HOST = config.HOST

app.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
    console.log(`Server is running on ${baseUrl}`);
});
