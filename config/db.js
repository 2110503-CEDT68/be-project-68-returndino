const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.set('strictQuery', true);//กันไม่ให้ไปหา field ที่ไม่มีอยู่จริง
    
    const conn = await mongoose.connect(process.env.MONGO_URI); //รอจนกว่าจะเชื่อม mongodb
    
    console.log(`MongoDB Connected: ${conn.connection.host}`); 
}

module.exports = connectDB;