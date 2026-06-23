const User = require("../models/User");

async function notifyAllAlumni(transporter, subject, html) {
    const users = await User.find({ role: "alumni" }, "email");

    const emailList = users
        .filter(user => user.email)
        .map(user => user.email);

    if (emailList.length === 0) {
        console.log("No alumni email addresses found");
        return;
    }

    await transporter.sendMail({
        from: process.env.EMAIL_USER,   // keep same as transporter login
        bcc: emailList,
        subject,
        html
    });

    console.log(`Notification sent to ${emailList.length} alumni`);
}

module.exports = notifyAllAlumni;