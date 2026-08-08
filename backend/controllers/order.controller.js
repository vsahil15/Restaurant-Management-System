import Order from '../models/orders.model.js';
 const addToOrder = async (req, res) => {
 const { itemName, itemPrice, quantity } = req.body;
 const orderItemName = itemName ;
 const orderItemPrice = itemPrice ;
 const orderQuantity = Number(quantity);
 const orderPrice = Number(orderItemPrice);

 if (!orderItemName || Number.isNaN(orderPrice) || Number.isNaN(orderQuantity)) {
  return res.status(400).json({
   error: 'Invalid order data. Expected name, price, and quantity.'
  });
 }

 const newOrder = new Order({
   items: [{
    name: orderItemName,
    price: orderPrice,
    quantity: orderQuantity
   }]
 });
 try {
  await newOrder.save();
  return res.status(200).json({
   message: 'Order placed successfully'
  });
 } catch (err) {
  console.error(err.message);
  return res.status(500).json({ error: 'Failed to place order' });
 }
};

const getOrder =async(req,res)=>{
  const { id } = req.body;
 const currentorder= await Order.findOne({_id : id});
 res.status(200).json({
  message: currentorder
 })
};

const cancelOrder = async(req,res) =>{
  const { id } = req.params;
  try{
    await Order.findByIdAndDelete({id});
    return res.status(200).json({
      message:"succussfully cancel your order.."
    })
  }catch(err){
    console.log("Failed to cancel the order..",err.message);
    return res.status(500).json({ error: 'Failed to cancel order' });
  }
};

/*const updateorder = async(req,res)=>{
  const {id} =req.body;
  await Order.findByIdAndUpdate({_id:id})
}*/

export {addToOrder,getOrder,cancelOrder}