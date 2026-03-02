const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');

// @desc    Get reservations
// @route   GET /api/v1/reservations
// @access  Private (user sees own, admin sees all)
exports.getReservations = async (req, res, next) => {
    try {
        let query;

        if (req.user.role === 'admin') {
            query = Reservation.find().populate('restaurant').populate('user');
        } else {
            query = Reservation.find({ user: req.user.id }).populate('restaurant');
        }

        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Get single reservation
// @route   GET /api/v1/reservations/:id
// @access  Private (owner or admin)
exports.getReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('restaurant')
            .populate('user');

        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        if (reservation.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to view this reservation'
            });
        }

        res.status(200).json({ success: true, data: reservation });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Create a reservation
// @route   POST /api/v1/reservations
// @access  Private (registered user)
exports.createReservation = async (req, res, next) => {
    try {
        // attach user id to body
        req.body.user = req.user.id;

        // ensure restaurant exists
        const restaurant = await Restaurant.findById(req.body.restaurant);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        // enforce max 3 reservations per user
        const count = await Reservation.countDocuments({ user: req.user.id });
        if (count >= 3) {
            return res.status(400).json({
                success: false,
                message: 'A user may have at most 3 reservations'
            });
        }

        const reservation = await Reservation.create(req.body);
        res.status(201).json({ success: true, data: reservation });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update a reservation
// @route   PUT /api/v1/reservations/:id
// @access  Private (owner or admin)
exports.updateReservation = async (req, res, next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this reservation'
            });
        }

        if (req.body.restaurant) {
            const rest = await Restaurant.findById(req.body.restaurant);
            if (!rest) {
                return res.status(404).json({ success: false, message: 'Restaurant not found' });
            }
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: reservation });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Delete a reservation
// @route   DELETE /api/v1/reservations/:id
// @access  Private (owner or admin)
exports.deleteReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this reservation'
            });
        }

        await reservation.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

