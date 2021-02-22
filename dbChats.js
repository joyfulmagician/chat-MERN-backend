import mongoose from 'mongoose'

const WhatsCloneSchema=mongoose.Schema({
    id:String,
    name:[String],
    email:[String]
});

export default mongoose.model('chats',WhatsCloneSchema);