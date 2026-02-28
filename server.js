const { setServers } = require("node:dns/promises"); //node.js use this DNS
setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { connect } = require('mongoose');

//route file
const auth = require('./routes/auth');
const restaurants = require('./routes/restaurants');

dotenv.config({path : './config/config.env'});

connectDB(); //เชื่อมDB

const app = express();

app.use(express.json()); //app อ่าน jsonได้
app.use(cookieParser()); //cookie parser

app.use('/api/v1/auth', auth);
app.use('/api/v1/restaurants' ,restaurants);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`); //สาเหตุที่พัง
    
    //ปิดเซิฟ ถ้า พัง
    server.close(() => process.exit(1));
});