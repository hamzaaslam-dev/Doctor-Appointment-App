const mongoose=require('mongoose');

const connectDB=async()=>{
try{
await mongoose.connect(process.env.MONGO_URL);
console.log("Succesfully Connected to MONGODB");
}

catch(err){
    console.log(err);

}
}

module.exports=connectDB;