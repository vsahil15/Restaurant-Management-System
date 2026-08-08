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

async function checkTable(Date,Time){
 const totalTable= 25;
 const combinedSlot =  `${Date}T${Time}:00`;
 const allTables = Array.from({length:totalTable},(_,i)=> i +1);
 const bookedSlot = await Booking.find({ bookingSlot:combinedSlot});
 const BookedTableNo = bookedSlot.map(booking => booking.tableNo);
 const vacantTable= await allTables.filter(tableNum => !BookedTableNo.includes(tableNum));

 return vacantTable;
}


const checkAvailable = async (req,res) => {
    const {bookDate,bookTime}=req.body;
    try{
    const vacantTable =  await checkTable(bookDate,bookTime);
    return res.status(200).json({
        message:"Available tables fetched successfully",
        totalVacantTable: vacantTable.length,
        vacantTable: vacantTable
    });
    }catch(err){
        console.error(err.message);
        return res.status(500).json({
         message: "An error occurred while checking table availability."
        }); 
    }
};

const cancelBooking =async (req,res) => {
    const { id } = req.params;

    try{
    const delelteBooking = await Booking.findByIdAndDelete(id);
    if(!delelteBooking){
        return res.status(404).json({message:"Booking not found"});
    }
    return res.status(200).json({message:"Booking successfully cancelled"});
}catch(err){
    return res.status(500).json({ message: "Server error during cancellation" });
}
};

const updateBooking= async(req,res)=>{
    const { id } = req.params;
    const { userTable, userTime, userDate } = req.body;
    const combinedSlot = `${userDate}T${userTime}:00`;
    try{
        const conflictingBooking = await Booking.findOne(
            {
                _id:{$ne: id},
                tableNo: userTable,
                bookingSlot: combinedSlot
            }
        );

         if (conflictingBooking) {
            return res.status(409).json({
                message: "Sorry, this table is already reserved by someone else for this time slot."
            });
        }
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
             { tableNo: userTable, bookingSlot: combinedSlot },
             { new: true, runValidators: true }
            
        );
    return res.status(200).json({
     message: "Booking successfully updated!",
     updatedBooking
    });   

}catch(err){
     return res.status(500).json({ message: "Server error during booing update" });
 }
};

export { booking,checkAvailable,cancelBooking,updateBooking };