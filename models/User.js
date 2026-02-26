const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    telephone: {
        type: String,
        required: [true, 'Please add a telephone number'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false //ยังไม่ดึงรหัสผ่านออกมาโชว์ตอนใช้คำสั่ง GET
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function() { //ก่อนจะsave ลง db 
    if (!this.isModified('password')) { //กันเปลี่ยนข้อมูล แล้วมันจะมา hashซ้ำ ไม่ได้เปลี่ยนจะข้าม
        next(); 
    }

    const salt = await bcrypt.genSalt(10); // เหยาะเกลือ10รอบ
    this.password = await bcrypt.hash(this.password, salt); // hash 

});

//เช็ค id แล้วไปเอา token ของคนนั้น
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// ตรวจรหัสผ่านตอน login  
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); //comparable แม้เหยาะเกลือนั้นต่างกันเหมือนฉันกับเธอ
};

module.exports = mongoose.model('User', UserSchema);