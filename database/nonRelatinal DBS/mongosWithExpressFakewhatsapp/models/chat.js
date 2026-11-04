
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const whatsappSchema = new Schema({
  from:{
    type:String,
    required:true
  },
  to:{
    type:String,
    required:true
  },
  msg:{
    type:String,
    required:true,
    length:50
  },
  created_at:{
    type:Date,
    required:true  
  }

  
});
const chat= mongoose.model('chat',whatsappSchema);
module.exports=chat;

