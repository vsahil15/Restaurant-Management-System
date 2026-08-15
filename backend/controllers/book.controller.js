import Booking from '../models/booked.model.js';

const isValidTimeSlot = (timeStr) => {
    if (!timeStr) return false;
    const parts = timeStr.split(':');
    if (parts.length < 2) return false;
    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);
    if (isNaN(hour) || isNaN(minute)) return false;
    const totalMinutes = hour * 60 + minute;
    // 5:00 PM is 17:00 -> 1020 minutes
    // 10:00 PM is 22:00 -> 1320 minutes
    return totalMinutes >= 1020 && totalMinutes <= 1320;
};

const parseBookingSlot = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const cleanTime = timeStr.split(':').slice(0, 2).join(':');
    const isoString = `${dateStr}T${cleanTime}:00`;
    const dateObj = new Date(isoString);
    return isNaN(dateObj.getTime()) ? null : dateObj;
};

const booking = async (req, res) => {
    const { userTable, userTime, userDate } = req.body;

    if (!userTable || !userTime || !userDate) {
        return res.status(400).json({
            message: 'Table number, date, and time slot are required.'
        });
    }

    if (!isValidTimeSlot(userTime)) {
        return res.status(400).json({
            message: 'Table bookings are only allowed between 5:00 PM and 10:00 PM.'
        });
    }

    const bookingSlot = parseBookingSlot(userDate, userTime);
    if (!bookingSlot) {
        return res.status(400).json({
            message: 'Invalid date or time format.'
        });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required to make a booking.' });
    }

    try {
      const tableNoNum = Number(userTable);

      const existingBooking = await Booking.findOne({
        tableNo: tableNoNum,
        bookingSlot: bookingSlot
      });
    
      if (existingBooking) {
        return res.status(409).json({
          message: "Sorry Sir, this time slot is already booked. Please choose a different time slot."
        });
      }

      const NewBooking = new Booking({
        userId,
        tableNo: tableNoNum,
        bookingSlot: bookingSlot
      });

      await NewBooking.save();
      return res.status(200).json({
        message: "Successfully Booked Table.."
      });
    } catch (err) {
      console.error("Booking failed error:", err);
      return res.status(500).json({
        message: err.message || "Sorry Table Booking failed, try again"
      });
    }
};

async function checkTable(DateVal, TimeVal) {
    const totalTable = 25;
    const bookingSlot = parseBookingSlot(DateVal, TimeVal);
    if (!bookingSlot) return Array.from({ length: totalTable }, (_, i) => i + 1);

    const allTables = Array.from({ length: totalTable }, (_, i) => i + 1);
    const bookedSlot = await Booking.find({ bookingSlot: bookingSlot });
    const BookedTableNo = bookedSlot.map(booking => booking.tableNo);
    const vacantTable = allTables.filter(tableNum => !BookedTableNo.includes(tableNum));

    return vacantTable;
}

const checkAvailable = async (req, res) => {
    const bookDate = req.body?.bookDate || req.query?.bookDate;
    const bookTime = req.body?.bookTime || req.query?.bookTime;

    if (!isValidTimeSlot(bookTime)) {
        return res.status(400).json({
            message: 'Table bookings are only allowed between 5:00 PM and 10:00 PM.'
        });
    }

    try {
        const vacantTable = await checkTable(bookDate, bookTime);
        return res.status(200).json({
            message: "Available tables fetched successfully",
            totalVacantTable: vacantTable.length,
            vacantTable: vacantTable
        });
    } catch (err) {
        console.error("Check availability error:", err);
        return res.status(500).json({
            message: "An error occurred while checking table availability."
        }); 
    }
};

const cancelBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const delelteBooking = await Booking.findByIdAndDelete(id);
        if (!delelteBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.status(200).json({ message: "Booking successfully cancelled" });
    } catch (err) {
        console.error("Cancel booking error:", err);
        return res.status(500).json({ message: "Server error during cancellation" });
    }
};

const updateBooking = async (req, res) => {
    const { id } = req.params;
    const { userTable, userTime, userDate } = req.body;

    if (!isValidTimeSlot(userTime)) {
        return res.status(400).json({
            message: 'Table bookings are only allowed between 5:00 PM and 10:00 PM.'
        });
    }

    const bookingSlot = parseBookingSlot(userDate, userTime);
    if (!bookingSlot) {
        return res.status(400).json({ message: 'Invalid date or time format.' });
    }

    try {
        const tableNoNum = Number(userTable);
        const conflictingBooking = await Booking.findOne({
            _id: { $ne: id },
            tableNo: tableNoNum,
            bookingSlot: bookingSlot
        });

        if (conflictingBooking) {
            return res.status(409).json({
                message: "Sorry, this table is already reserved by someone else for this time slot."
            });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { tableNo: tableNoNum, bookingSlot: bookingSlot },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: "Booking successfully updated!",
            updatedBooking
        });
    } catch (err) {
        console.error("Update booking error:", err);
        return res.status(500).json({ message: "Server error during booking update" });
    }
};

const getUserBookings = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    try {
        const bookings = await Booking.find({ userId }).sort({ bookingSlot: 1 });
        return res.status(200).json({ bookings });
    } catch (err) {
        console.error("Get user bookings error:", err);
        return res.status(500).json({ message: 'Failed to retrieve bookings.' });
    }
};

export { booking, checkAvailable, cancelBooking, updateBooking, getUserBookings };