const express=require('express');
const app=express();   
const path=require('path');
const Chat=require('./models/chat.js');
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));


// Database Mongoose connections form
const mongoose=require('mongoose')
main().catch(err=>console.log(err));
async function main(){
    mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}


app.get("/",(req,res)=>{
    res.send("working")
})
app.get("/chat",async(req,res)=>{
   let chats=await Chat.find()
  res.render('index', {chats})
})
  
app.listen(8080,()=>{
    console.log("listening on port number 8080")
})