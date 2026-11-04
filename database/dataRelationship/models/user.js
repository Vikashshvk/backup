// const Listing=require("./models/listing.js");


const mongoose=require("mongoose");
const {Schema}=mongoose;
const MONGO_URL="mongodb://127.0.0.1:27017/relationDemo";

main().then((res)=>{
        console.log("database is connected")
}).catch((err)=>{
    console.log(err)
});
 async function  main(){
    await mongoose.connect(MONGO_URL);
 }

 const userSchem=new Schema({
    username: String,
    addresses:[{
        location:String,
        city:String
    }]
 })

 const user= mongoose.model("user",userSchem);

 const addUser= async ()=>{
    let user1= new user({
        username:"sherlock",
        addresses:[{
            location:"shibuya",
            city:"tokyo"
        },],
    })
    user1.addresses.push({location:"hidden leaf", city:"fire"})
        
   
   const res= await user1.save();
    console.log(res);
 }

 addUser();




