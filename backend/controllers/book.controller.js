import Booking from '../models/booked.model.js';
const booking = async(req,res)=>{
    const { userTable,userTime,userDate } = req.body;
    const combinedSlot = `${userDate}T${userTime}:00`;

try{
     
    const existingBooking = await Booking.findOne({
                                            tableNo: userTable,
                                            bookingSlot: combinedSlot
                                           });
    
    //validation of user entered data has not been done in backend
    if(existingBooking){
      return res.status(409).json({
                message: "Sorry Sir, this time slot is already booked. Please choose a different time slot."
            });
    }

    const NewBooking = new Booking({
        tableNo: userTable,
        bookingSlot: combinedSlot
    });

  
    await NewBooking.save();
    return res.status(200).json({
        message:"Successfully Booked Table.."
     })}catch(err){
        console.error(err.message);
        return res.status(500).json({
            message:"Sorry Table Booking failed, try again"
        })
     }
   
    
    
};

export { booking };