import mongoose from 'mongoose'

const WhatsCloneSchema=mongoose.Schema({
    name:String,
    email:String,
    img:String
});

export default mongoose.model('users',WhatsCloneSchema);