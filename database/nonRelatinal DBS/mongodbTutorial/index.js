
const mongoose=require("mongoose")
//1. schema define or structure of collections
const chatSchema=new mongoose.Schema({
    name:{
        type:String,
        require: true
    },
    
    created_at:{
        type:Date,
        require:true
    }
})
//end schema


//2. how to make collections  and front of comma chatSchema is define to what a structure will be our collections
const book=mongoose.model("book",chatSchema)
// end model or collections





//3. how connect with mongodb with express 
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/t');
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
//connection complete




//4. insert data insto science who is data of book collections , and collections is 't'__ t- is database
 let science= new book({
    name:"science",
    created_at:new Date()
    
 })
 //complete insertions




 //5. save data into database
 science.save().then((res)=>{
    console.log(res)
 
 })

 // complete