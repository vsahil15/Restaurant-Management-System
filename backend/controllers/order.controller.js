import Order from '../models/orders.model.js';
import Ingredient from '../models/ingredient.model.js';




  async function KillIngredient(orderDetails){
  // 1. Get the name of the ordered item
  const orderName = orderDetails.items[0].name;
  let bulkOps = [];

  // 2. The switch runs here to fill the bulkOps array based on the name
  switch(orderName) {
    case "veg paneer":
      bulkOps = [
        { updateOne: { filter: { itemName: 'paneer' }, update: { $inc: { quantity: -200 } } } },
        { updateOne: { filter: { itemName: 'salt' }, update: { $inc: { quantity: -5 } } } }
      ];
      break;

    case "chilly paneer":
      bulkOps = [
        { updateOne: { filter: { itemName: 'paneer' }, update: { $inc: { quantity: -150 } } } },
        { updateOne: { filter: { itemName: 'capsicum' }, update: { $inc: { quantity: -50 } } } }
      ];
      break;
      
    // ... all other cases go here ...
    
    default:
      console.log(`No ingredient deduction rule set for: ${orderName}`);
      return; 
  }

  // 3. Right after the switch finishes, this block automatically runs 
  // using the bulkOps array created by the switch above
  if (bulkOps.length > 0) {
    try {
      const requiredSpices = await Ingredient.bulkWrite(bulkOps);
      console.log(`Ingredients updated for ${orderName}:`, requiredSpices);
    } catch (err) {
      console.error("Failed to update ingredients:", err.message);
      throw err; 
    }
  }
}


 const addToOrder = async (req, res) => {
 const { itemName, itemPrice, quantity } = req.body;
 const userId = req.user?.id;
 
 const orderItemName = itemName;
 const orderItemPrice = itemPrice;
 const orderQuantity = Number(quantity);
 const orderPrice = Number(orderItemPrice);

 if (!userId) {
  return res.status(401).json({
   error: 'Authentication required to place an order.'
  });
 }

 if (!orderItemName || Number.isNaN(orderPrice) || Number.isNaN(orderQuantity)) {
  return res.status(400).json({
   error: 'Invalid order data. Expected name, price, and quantity.'
  });
 }

 const newOrder = new Order({
  userId:userId,
   items: [{
    name: orderItemName,
    price: orderPrice,
    quantity: orderQuantity
   }]
 }
 
);
 try {
  await newOrder.save();
  await KillIngredient(newOrder);
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
    await Order.findByIdAndDelete(id);
    return res.status(200).json({
      message:"succussfully cancel your order.."
    })
  }catch(err){
    console.log("Failed to cancel the order..",err.message);
    return res.status(500).json({ error: 'Failed to cancel order' });
  }
};

const getUserOrders = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
};

/*const updateorder = async(req,res)=>{
  const {id} =req.body;
  await Order.findByIdAndUpdate({_id:id})
}*/

export {addToOrder,getOrder,cancelOrder,getUserOrders}