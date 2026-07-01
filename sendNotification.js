const User = require("../models/User");

async function notifyAllAlumni(transporter, subject, html) {
    const users = await User.find({}, "email");

    const emails = users
        .filter(user => user.email)
        .map(user => user.email);

    if (emails.length === 0) {
        console.log("No alumni emails found");
        return;
    }

    await transporter.sendMail({
        from: process.env.SYSTEM_EMAIL,
        bcc: emails,
        subject,
        html
    });

    console.log(`Notification sent to ${emails.length} alumni`);
}

module.exports = notifyAllAlumni;