const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');

//@desc   Get all restaurants
//@route  Get /api/v1/restaurants
//@access Public
exports.getRestaurants = async (req, res, next) => {
    // must implement sort ,...
    try {
        let query;

        //Copy req.query
        const reqQuery = {...req.query};
        
        //Fields to exclude
        const removeFields = ['select' ,'sort' ,'page' ,'limit'];

        //Loop over remove fields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        //Create query string
        let queryStr = JSON.stringify(reqQuery);

        //Create operators
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g ,match => `$${match}`);

        //finding resource
        query = Restaurant.find(JSON.parse(queryStr)); //may be implement populate later

        //select fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        //Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query=query.sort('-createdAt');
        }

        //Pagination
        const page = parseInt(req.query.page ,10) || 1;
        const limit = parseInt(req.query.limit ,10) || 25;
        const startIndex = (page-1) * limit;
        const endIndex = page*limit;
        const total = await Restaurant.countDocuments(JSON.parse(queryStr));

        query = query.skip(startIndex).limit(limit);


        //Executing query
        const restaurants = await query;

        //Pagination result
        const pagination = {};
        
        if (endIndex < total) {
            pagination.next ={
                page:page+1 ,
                limit
            }
        }

        if (startIndex > 0) {
            pagination.prev = {
                page:page-1 ,
                limit
            }
        }

        res.status(200).json({
            success:true ,
            count:restaurants.length ,
            // pagination ,
            data:restaurants});

    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//@desc   Get one restaurants
//@route  Get /api/v1/restaurants/:id
//@access Public
exports.getRestaurant = async (req ,res ,next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(400).json({success: false});
        }

        res.status(200).json({
            success: true ,
            data: restaurant
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
}

//@desc     Create one restaurant 
//@route    POST /api/v1/restaurants
//@access   Private
exports.createRestaurant = async (req ,res ,next) => {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({
        success: true ,
        data: restaurant
    });
}

//@desc   Update one restaurant
//@route  PUT /api/v1/restaurants/:id
//@access Private
exports.updateRestaurant = async (req ,res ,next) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id ,req.body ,{
            new: true ,
            runValidators: true
        });

        if (!restaurant) {
            return res.status(400).json({success: false ,message:`Restaurant not found with id of ${req.params.id}`});
        }

        res.status(200).json({success: true ,data: restaurant});
    } catch (err) {
        res.status(400).json({success: false});
    }
};

//@desc   Delete one restaurant
//@route  DELETE /api/v1/restaurants/:id
//@access Private
exports.deleteRestaurant = async (req ,res ,next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(400).json({success:false ,message:`Restaurant not found with id of ${req.params.id}`})
        }

        await Reservation.deleteMany({restaurant: req.params.id});
        await Restaurant.deleteOne({_id: req.params.id});

        res.status(200).json({success: true ,data: {}});
    } catch (err) {
        res.status(400).json({success: false});
    }
}