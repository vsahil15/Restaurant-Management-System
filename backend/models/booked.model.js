import mongoose from 'mongoose';

const bookingDetails = new mongoose.Schema({
    userId: { type: String, required: true },
    tableNo: { type: Number, required: true },
    bookingSlot: { type: Date, required: true }
}, {
  timestamps: true 
});

const Booking = mongoose.model('Booking',bookingDetails);

export default Booking;