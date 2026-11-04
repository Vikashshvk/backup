const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/amazon');

main().then(() => console.log('Connected'))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/amazon');
}

const bookSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:String,
    age:Number 
})

const book=mongoose.model("book",bookSchema);