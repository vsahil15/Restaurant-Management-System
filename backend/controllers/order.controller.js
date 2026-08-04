import Order from '../models/orders.model.js';
const addToOrder = async(req,res) => {
 const {itemName,itemPrice,quantity} = req.body;
 const newOrder = new Order({
   items:[{
    name:itemName,
    price:Number(itemPrice),
    quantity:Number(quantity)
   }]
 })
}
