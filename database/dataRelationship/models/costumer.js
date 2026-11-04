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


 const orderSchema= new Schema({
     item:String,
     price:Number
 })


 const costumerSchema = new Schema({
     name:String,
     orders:[
        {type:Schema.Types.ObjectId,ref:"order"}
     ]
 })

//  costumerSchema.pre("findOneAndDelete", async () => {
// console. log("PRE MIDDLEWARE");
// });

costumerSchema.post("findOneAndDelete", async (customer) => {
if(customer.orders.length)
{
    let res = await order.deleteMany({ _id: { $in: customer.orders } });
console.log(res);
}

});

  const order= mongoose.model("order",orderSchema);
 const costumer= mongoose.model("costumer",costumerSchema);
 
//Functions
const findCustomer = async () => {
let result = await costumer.find({}).populate("orders");
console. log(result [0]);

};

const addCust = async () => {
let newCust = new costumer({
name: "Karan Arjun",
});
 
let newOrder = new order({
item: "kurkure",
price: 250,
});

newCust.orders.push(newOrder);

await newOrder.save(); 
await newCust.save();

console. log("added new customer");
}
// addCust();


const delCust = async () => {
let data = await costumer.findByIdAndDelete("6a470fa77640db93775c9100");
console.log(data);

};

delCust();























//  const addUser= async ()=>{
//   let res=  await order.insertMany([
//         {item:"chips",price:100},
//         {item:"burger",price:200},
//         {item:"pizza",price:300},]
//     )
//     console.log(res)

//  }

//  addUser(); 




//  const addcostumer= async ()=>{
//     let cost1= new costumer({
//         name:"rahul",

//     })

//     let order1= await order.findOne({item:"burger"})
//     let order2= await order.findOne({item:"pizza"})
 
//     cost1.orders.push(order1);
//     cost1.orders.push(order2);

//     let result =await cost1.save();
//     console.log(result)
//     let result= await costumer.find({});
//     console.log(result)
//  }

 

// addcostumer();

