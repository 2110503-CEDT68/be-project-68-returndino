const jwt = require('jsonwebtoken');
const User = require('../models/User');

//protect routes ตรวจคนเข้าเมือง
exports.protect = async (req, res, next)=>{
    let token;
    
    //frontend send (Bearer jwt) checkว่าเริ่มด้วยBearerไหม
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){ 
        token = req.headers.authorization.split(' ')[1]; //split เอาtokenมา
    }

    //หาtoken ไม่เจอ || token =='null
    if(!token || token == 'null'){
        return res.status(401).json({success: false, message: 'Not authorize to access this route'});
    }

    try{
        //verify token ถูกแก้ไขหรือหมดอายุ -> err
        const decoded =jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        //user ที่มี tokenอันนี้แสดงว่า เป็นคนไหน
        req.user = await User.findById(decoded.id);

        next();
    }catch(err){
        console.log(err.stack);
        return res.status(401).json({success: false, message: 'Not authorize to access this route'});
    }
}

exports.authorize=(...roles) => {
    return (req, res, next)=>{
        //เปิดดูใน protectว่าเป็น user roleไร
        if(!roles.includes(req.user.role)){
            return res.status(403).json({success:false, message:`User role ${req.user.role} is not authorized to access this role`});
        }
        next();
    }
}