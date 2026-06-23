const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema({

    image:{
        type:String,
        required:true
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});

module.exports =
mongoose.model(
    "Gallery",
    GallerySchema
);