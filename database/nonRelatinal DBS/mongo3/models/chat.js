const mongoose=require('mongoose')
main().catch(err=>console.log(err));
async function main(){
    mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

const schema=new mongoose.Schema({
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
        required:true
    },
    created_at:{
        type:Date,
        default:Date.now
    }
})

const Chat=mongoose.model('Chat',schema);

module.exports=Chat;