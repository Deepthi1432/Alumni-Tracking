const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({

    firstName:{
        type:String,
        required:true
    },

    lastName:{
        type:String,
        required:true
    },

    admissionNumber:{
        type:String,
        required:true,
        unique:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true
    },

    department:String,
    course:String,
    passedOutYear:Number,
    gender:String,
    dob:Date,
    phone:String,
    city:String,
    placementType:String,
    workingStatus:String,
    company:String,
    designation:String,
    sector:String,

    role:{
        type:String,
        default:"alumni"
    },

    resetPasswordToken:{
        type:String
    },

    resetPasswordExpires:{
        type:Date
    }

},{
    timestamps:true
});

module.exports =
mongoose.model(
"User",
UserSchema
);