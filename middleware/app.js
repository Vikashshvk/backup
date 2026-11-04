const express=require('express');
const app=express();


app.use((req,res,next)=>{
       req.time=new Date(Date.now()).toString()
       console.log(req.method, req.time)
       console.log("middleware")
     next(); 
})
    
app.get("/Home",(req,res)=>{
      res.send("hello world")
})

app.get("/random",(req,res)=>{
    res.send("random")
})

app.listen(8080,(req,res)=>{
    console.log("listening on 8080")
})