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


 const userSchema= new Schema({
     username:String,
     email:String,
 })

 const postSchema= new Schema({
       content:String,
       likes:Number,
       user:{
         type:Schema.Types.ObjectId,
         ref:"user"
       }

 })

 const User= mongoose.model("User",userSchema);
 const Post= mongoose.model("Post",postSchema);


 //Functions
const findCustomer = async () => {
let result = await Customer.find({}).populate("orders");
console. log(result[0]);

};

