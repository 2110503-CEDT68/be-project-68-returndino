const User = require('../models/User');

//@desc Register
//@route Post /api/v1/auth/register
//@access Public
exports.register = async (req, res, next) => {
    try{
        const {name, email, password, telephone} = req.body; //รับreq

        // วิ่งไป createใน -> models 
        const user = await User.create({
            name,
            email,
            password,
            telephone
        });

        sendTokenResponse(user, 200, res);
    }catch(err){
        res.status(400).json({success:false});
        console.log(err.stack);
    }
};

//@desc Login
//@route Post /api/v1/auth/login
//@access Public
exports.login = async (req, res, next) => {
    try{
        const {email, password} = req.body;


        //ส่งemail and passwordมาไหม
        if(!email || !password){
            return res.status(400).json({
                success: false,
                msg: 'Please provide an email and password'
            }); 
        }
        //find this user
        const user = await User.findOne({ email }).select('+password');

        //user มีอยุ่จริงไหม
        if(!user){
            return res.status(400).json({
                success: false,
                msg: 'Invalid credentials'
            });
        }

        //password match ไหม -> compare
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                msg: 'Invalid credentials'
            });
        }

        sendTokenResponse(user, 200, res);

    }catch(err){
        res.status(401).json({success:false, msg:'Cannot convert email or password to string'});
    }
};

//@desc getMe
//@route Post /api/v1/auth/getMe
//@access Private
                            
exports.getMe = async (req,res,next) => {
                                     //มาจาก protect
    const user = await User.findById(req.user.id);
    res.status(200).json({success:true, data: user});
}

//@desc Log user out / clear cookie
//@route GET /api/v1/auth/logout
//@access Private
exports.logout = async (req,res,next) => {
    // เปลี่ยนค่า token ให้เป็น noneแล้วทำลายภายใน10วิ
    res.cookie('token', 'none',{
        expires: new Date(Date.now() + 10*1000),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        data:{}
    });
}

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000)//วันหมดอายุ 
        ,httpOnly: true //กันxss frontendดู
    }

    if(process.env.NODE_ENV === 'production'){ //run บนเซิฟจริง cookie จะส่งเฉพาะ https
        options.secure = true;
    }
                            // ชื่อ cookie JWT constrainCookie
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    });
};