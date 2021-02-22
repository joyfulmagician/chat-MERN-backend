import mongoose from 'mongoose'

const WhatsCloneSchema=mongoose.Schema({
    message:String,
    name:String,
    timestamp:String,
    received:Boolean,
    roomid:String,
    googleid:String,
});

export default mongoose.model('messagecontents',WhatsCloneSchema);