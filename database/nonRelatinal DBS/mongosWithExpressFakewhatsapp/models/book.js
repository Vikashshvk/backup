
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
  message:{
    type:String,
    required:true,
    length:50
  },
  created_at:{
    type:Date,
    required:true  
  }

  
});
const book= mongoose.model('book',whatsappSchema);
module.exports=book;

