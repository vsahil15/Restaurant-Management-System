import Booking from '../models/booked.model.js'

export async function bookedOrNot(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required to place an order.'
      });
    }

    const hasBooking = await Booking.exists({ userId });
    if (!hasBooking) {
      return res.status(403).json({
        message: 'Please book a table before placing an order.'
      });
    }
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Unable to verify booking status. Please try again later.'
    });
  }
}
