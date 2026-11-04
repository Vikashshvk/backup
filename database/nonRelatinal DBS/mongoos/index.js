const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test');

main().then(() => console.log('Connected'))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
const Schema = mongoose.Schema({
    name:String,
    email:String,
    age:Number
})

const User=mongoose.model('User',Schema);

User.findByIdAndDelete('69cf39c53c7eca9fec6a1f5a').then(res=>{
    console.log(res);
}).catch(err=>{
    console.log(err);
});

// User.findByIdAndUpdate('69cf3d0662dcb5a40358513b',{age:111},{new:true}).then(res=>{
//     console.log(res);
// }).catch(err=>{
//     console.log(err);
// });

// User.findById('69cf3d0662dcb5a40358513c').then(res=>{
//     console.log(res);
// }).catch(err=>{
//     console.log(err);
// });

// User.insertMany([
//     {name:"bob",email:"bob.gmail.com",age:23},
//     {name:"oggy",email:"oggy.gmail.com",age:15},
//     {name:"jack",email:"jack.gmail.com",age:23},
// ]).then((res=>{console.log(res)}))



// const user2=new User({
//     name:"eve",
//     age:60,
// });
// user2.save().then(res=>{
//     console.log(res);
// }).catch(err=>{
//     console.log(err);
// })