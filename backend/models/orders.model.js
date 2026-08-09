import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    items:[{
        name:String,
        price:Number,
        quantity:Number
    }]
}, {
  timestamps: true 
});

const Order = mongoose.model('Order',orderSchema);

export default Order;