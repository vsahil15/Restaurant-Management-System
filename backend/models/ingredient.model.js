import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({

    itemName:{
         type:String,
         required:true,
         trim:true,
         unique:true
      },
    itemCurrentStock:{
      type:Number,
      min:0,
      default:0
     },
    stockUnit:{
      type:String,
      required:[true,'Measurement unit is required'],
      enum:{
        values:['g'],
        message:'Ingredient stock unit must be grams (g)'
      },
      default:'g',
      trim:true
    }, 
    costPerUnit:{
      type:Number,
      required:[true,'cost per unit require for sales report']
    }

}, {
  timestamps: true 
});

const Ingredient = mongoose.model('Ingredient',ingredientSchema);

export default Ingredient;