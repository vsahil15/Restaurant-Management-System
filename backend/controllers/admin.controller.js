import User from '../models/user.model.js';
import Order from '../models/orders.model.js';
import Booking from '../models/booked.model.js';

const getAdminDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalBookings] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Booking.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalBookings
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load admin statistics.',
      error: err.message
    });
  }
};

const getOrdersByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Date is required.' });
  }

  try {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      date,
      orders,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => {
        const lineTotal = (order.items || []).reduce((itemSum, item) => itemSum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
        return sum + lineTotal;
      }, 0)
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders by date.',
      error: err.message
    });
  }
};

const getUserBill = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required.' });
  }

  try {
    const user = await User.findOne({ name: new RegExp(`^${username}$`, 'i') });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const orders = await Order.find({ userId: user._id.toString() }).sort({ createdAt: -1 });

    const totalBill = orders.reduce((sum, order) => {
      const lineTotal = (order.items || []).reduce((itemSum, item) => itemSum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
      return sum + lineTotal;
    }, 0);

    return res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
      orders,
      totalBill
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user billing information.',
      error: err.message
    });
  }
};

const getBookedTables = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ bookingSlot: 1 });
    return res.status(200).json({
      success: true,
      bookings
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booked tables.',
      error: err.message
    });
  }
};

const freeTable = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Table has been freed successfully.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to free the table.',
      error: err.message
    });
  }
};

export { getAdminDashboardStats, getOrdersByDate, getUserBill, getBookedTables, freeTable };
