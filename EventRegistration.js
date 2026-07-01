const mongoose = require("mongoose");

const EventRegistrationSchema =
new mongoose.Schema({

    eventId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Event"
    },

    alumniId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    alumniName:String,

    email:String,

    registeredAt:{
        type:Date,
        default:Date.now
    }

});

module.exports =
mongoose.model(
"EventRegistration",
EventRegistrationSchema
);