const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    pname: {
        type: String,
        required: true,
        unique: true
    },
    image:{
        type: String,
        required: true
    },
    price:{
        type:Number,
        required: true
    }
})
module.exports = mongoose.model("product", productSchema);