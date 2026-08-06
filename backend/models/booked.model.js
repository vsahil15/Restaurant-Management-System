import mongoose from 'mongoose';

const bookingDetails = new mongoose.Schema({
    tableNo:{ type: Number, required : true },
   bookingSlot: { type: Date, required: true, unique: true}
});

const Booking = mongoose.model('Booking',bookingDetails);

export default Booking;