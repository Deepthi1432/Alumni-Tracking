const express = require("express");

const router = express.Router();

const EventRegistration =
require("../models/EventRegistration");

router.post("/", async(req,res)=>{

    try{

        const registration =
        new EventRegistration(
        req.body
        );

        await registration.save();

        res.json({
            message:
            "Registered Successfully"
        });

    }
    catch(err){

        res.status(500).json({
            error:err.message
        });

    }

});

router.get("/", async(req,res)=>{

    const registrations =
    await EventRegistration.find();

    res.json(
    registrations
    );

});

module.exports =router;