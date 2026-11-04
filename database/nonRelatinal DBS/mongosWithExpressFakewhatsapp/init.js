const mongoose = require('mongoose');
const Chat = require("./models/chat.js");

// main() ko await ke sath ya proper handle karke chalayein
main()
  .then(() => console.log("Connection successful"))
  .catch(err => console.log("Connection error:", err));

async function main() {
    // [::1] ki jagah 127.0.0.1 use karein agar abhi bhi dikkat aaye
    await mongoose.connect('mongodb://127.0.0.1:27017/fakewhatsapp', {
        serverSelectionTimeoutMS: 5000 
    });
    
    let allchats = [
        { from: "vikash", to: "neil", msg: "hello", created_at: new Date() },
        { from: "shalini", to: "mummy", msg: "hello", created_at: new Date() },
        { from: "vikash", to: "shivi", msg: "hello", created_at: new Date() }
    ];

    await Chat.insertMany(allchats);
    console.log("Data was initialized"); 
    
    // Connection close karne se pehle ensure karein ki insert complete ho chuka hai
    await mongoose.connection.close(); 
    console.log("Connection closed");
}