import Order from '../models/orders.model.js';
import Ingredient from '../models/ingredient.model.js';

const getAll = async(req,res)=>{
 try{
    const currentStock = await Ingredient.find().sort({createdAt: -1});
    res.status(200).json({
      success:true,
      data:currentStock
    });
 }catch(err){
  return res.status(500).json({
    success:false,
    message:"failed to fetch the information",
    error: err.message
  });
 }

}


const addIngredient = async(req,res)=>{
 const { itemName, itemCurrentStock,stockUnit,costPerUnit}= req.body;
try{
 const newIngredient = new Ingredient({
    itemName,
    itemCurrentStock,
    stockUnit,
    costPerUnit
 });

 await newIngredient.save();
 
 return res.status(201).json({
    success:true,
    message:"ingredient successfully added..",
    data: newIngredient
});
}catch(err){
    console.log("Error adding ingredient:",err.message);
  return res.status(500).json({
    success:false,
    message:"Failed to add ingredient.",
    error: err.message
  }
)
}};

const refillIngredient = async(req,res)=>{
  const { id } = req.params;
  const { rawMaterialName,addQuantity,materialunit,perPrice } = req.body;
 try{
  const restock = await Ingredient.findByIdAndUpdate(id,{
    itemName:rawMaterialName ,
    $inc:{itemCurrentStock:addQuantity},
    stockUnit:materialunit,
    costPerUnit:perPrice
  },
{
  new:true
});
   if (!restock) {
      return res.status(404).json({
        success: false,
        message: "Ingredient item not found."
      });
    }
 return res.status(200).json({
  success: true,
  message:"raw material successfully added..",
  data: restock
 })

}catch(err){
  return res.status(500).json({
    success:false,
    message:"failed to add raw material, try once again",
    error:err.message
  })
}
}

export {getAll,addIngredient,refillIngredient}