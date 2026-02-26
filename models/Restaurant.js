const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a restaurant name'],
        unique: true,
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    telephone: {
        type: String,
        required: [true, 'Please add a telephone number']
    },
    open_close_time: {
        type: String,
        required: [true, 'Please add open-close time (e.g., 10:00-22:00)']
    }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);