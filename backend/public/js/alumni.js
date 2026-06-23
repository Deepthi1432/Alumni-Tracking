const yearSelect =
document.getElementById(
"passedOutYear"
);
if(yearSelect){

const currentYear =
new Date().getFullYear();
for(
    let year=currentYear;
    year>=1996;
    year--
){
    const option =
    document.createElement(
    "option"
    );
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(
    option
    );

}
}
// Load Profile
async function loadProfile(){
const token =
localStorage.getItem(
"token"
);
try{
    const res =
    await fetch(
    "http://localhost:5000/users/profile",
    {
        headers:{
            Authorization:
            token
        }
    });
    const data =
    await res.json();
    if(data.error){
        alert(
        "Please login again"
        );
        window.location.href =
        "alumni-login.html";
        return;
    }
    if(document.getElementById("profilePic")){
        document.getElementById(
        "profilePic"
        ).src =
        data.photoUrl ||
        "default.jpg";
    }
   if(document.getElementById("firstName"))
    document.getElementById("firstName").value =
    data.firstName || "";
    if(document.getElementById("lastName"))
    document.getElementById("lastName").value =
    data.lastName || "";
    if(document.getElementById("email"))
    document.getElementById("email").value =
    data.email || "";
    if(document.getElementById("admissionNumber"))
    document.getElementById("admissionNumber").value =
    data.admissionNumber || "";
    if(document.getElementById("department"))
    document.getElementById("department").value =
    data.department || "";
    if(document.getElementById("course"))
    document.getElementById("course").value =
    data.course || "";
    if(document.getElementById("passedOutYear"))
    document.getElementById("passedOutYear").value =
    data.passedOutYear || "";
    if(document.getElementById("workingStatus"))
    document.getElementById("workingStatus").value =
    data.workingStatus || "";
    if(document.getElementById("company"))
    document.getElementById("company").value =
    data.company || "";
    if(document.getElementById("designation"))
    document.getElementById("designation").value =
    data.designation || "";
    if(document.getElementById("city"))
    document.getElementById("city").value =
    data.city || "";
}
catch(err){
    console.error(err);
}
}
// Update Profile
const profileForm =
document.getElementById(
"profileForm"
);

if(profileForm){

```
profileForm.addEventListener(
"submit",
async (e)=>{

    e.preventDefault();

    const token =
    localStorage.getItem(
    "token"
    );

    const updated = {

        firstName:
        document.getElementById(
        "firstName"
        ).value,

        lastName:
        document.getElementById(
        "lastName"
        ).value,

        admissionNumber:
        document.getElementById(
        "admissionNumber"
        ).value,

        department:
        document.getElementById(
        "department"
        ).value,

        course:
        document.getElementById(
        "course"
        ).value,

        passedOutYear:
        document.getElementById(
        "passedOutYear"
        ).value,

        workingStatus:
        document.getElementById(
        "workingStatus"
        ).value,

        company:
        document.getElementById(
        "company"
        ).value,

        designation:
        document.getElementById(
        "designation"
        ).value,

        city:
        document.getElementById(
        "city"
        ).value

    };

    const res =
    await fetch(
    "http://localhost:5000/users/profile",
    {
        method:"PUT",

        headers:{
            "Content-Type":
            "application/json",

            Authorization:
            token
        },

        body:JSON.stringify(
        updated
        )

    });

    const data =
    await res.json();

    document.getElementById(
    "profileMsg"
    ).textContent =
    data.message ||
    data.error;

});
```

}

// Upload Photo

const photoForm =
document.getElementById(
"photoForm"
);

if(photoForm){
photoForm.addEventListener(
"submit",
async (e)=>{

    e.preventDefault();

    const token =
    localStorage.getItem(
    "token"
    );

    const formData =
    new FormData();

    formData.append(
    "photo",
    document.getElementById(
    "photoInput"
    ).files[0]
    );

    const res =
    await fetch(
    "http://localhost:5000/users/profile/photo",
    {
        method:"POST",

        headers:{
            Authorization:
            token
        },

        body:formData

    });

    const data =
    await res.json();

    if(data.photoUrl){

        document.getElementById(
        "profilePic"
        ).src =
        "http://localhost:5000"
        + data.photoUrl;

    }

    alert(
    data.message ||
    data.error
    );

});
}
loadProfile();
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// ... your existing routes might be here (e.g., router.get("/", ...))

/* =======================================================
   🌟 PASTE THE PLACEMENT SEARCH ENDPOINT CODE HERE
   ======================================================= */
router.get("/placement-search", async (req, res) => {
    try {
        const { branch, year, company } = req.query;
        let queryCondition = {};

        if (branch) queryCondition.department = branch; // Maps to your schema's field
        if (year) queryCondition.passedOutYear = parseInt(year); // Maps to your schema's field
        if (company) queryCondition.company = { $regex: company, $options: "i" };

        console.log("Executing Filter Query:", queryCondition);

        const records = await mongoose.model('Alumni').find(queryCondition);
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Always keep this line at the very bottom of the file
module.exports = router;