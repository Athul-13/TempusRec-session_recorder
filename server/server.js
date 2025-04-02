const express = require('express')
const cors = require('cors')
const http = require('http')
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes')
const rrwebRoutes = require('./routes/rrwebRoutes')

require('dotenv').config()

const app = express()
const server = http.createServer(app)

connectDB();

app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())

app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL, 
            'chrome-extension://ibjljlkkjfffeejphhhoohgbegfjcfpi'
        ],
        credentials: true,
    })
)

app.use('/api/auth', authRoutes);
app.use('/api/recording', rrwebRoutes)

app.use((req, res) => {
    res.status(404);
    res.json({ message: 'Resource not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});