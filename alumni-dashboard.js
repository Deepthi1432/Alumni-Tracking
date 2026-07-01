/* =========================
   CHECK LOGIN
========================= */

const token =
localStorage.getItem(
"token"
);

if(!token){

    alert(
    "Please login first"
    );

    window.location.href =
    "alumni-login.html";

}

/* =========================
   LOAD PROFILE
========================= */

async function loadProfile(){

    try{

        const res =
        await fetch(

        "http://localhost:5000/users/profile",

        {
            headers:{
                Authorization:
                token
            }
        }

        );

        const user =
        await res.json();

        if(user.error){

            alert(
            "Session Expired"
            );

            localStorage.removeItem(
            "token"
            );

            window.location.href =
            "alumni-login.html";

            return;

        }

        document.getElementById(
        "fullName"
        ).textContent =
        `${user.firstName || ""} ${user.lastName || ""}`;

        document.getElementById(
        "email"
        ).textContent =
        user.email || "-";

        document.getElementById(
        "admissionNumber"
        ).textContent =
        user.admissionNumber || "-";

        document.getElementById(
        "department"
        ).textContent =
        user.department || "-";

        document.getElementById(
        "course"
        ).textContent =
        user.course || "-";

        document.getElementById(
        "passedOutYear"
        ).textContent =
        user.passedOutYear || "-";

        document.getElementById(
        "company"
        ).textContent =
        user.company || "-";

        document.getElementById(
        "designation"
        ).textContent =
        user.designation || "-";

        document.getElementById(
        "city"
        ).textContent =
        user.city || "-";

        document.getElementById(
        "workingStatus"
        ).textContent =
        user.workingStatus || "-";

        if(
            user.photoUrl &&
            document.getElementById(
            "profilePic"
            )
        ){

            document.getElementById(
            "profilePic"
            ).src =
            "http://localhost:5000" +
            user.photoUrl;

        }

    }
    catch(err){

        console.error(err);

        alert(
        "Unable to load profile"
        );

    }

}

/* =========================
   LOAD ANNOUNCEMENTS
========================= */

async function loadAnnouncements(){

    const list =
    document.getElementById(
    "announcementList"
    );

    if(!list) return;

    try{

        const res =
        await fetch(
        "http://localhost:5000/announcements"
        );

        const data =
        await res.json();

        list.innerHTML = "";

        data.forEach(item=>{

            list.innerHTML += `

            <div class="announcement-card">

                <h4>
                Announcement
                </h4>

                <p>
                ${item.text}
                </p>

            </div>

            `;

        });

    }
    catch(err){

        console.error(err);

    }

}

/* =========================
   LOAD EVENTS
========================= */

async function loadEvents(){

    const list =
    document.getElementById(
    "eventList"
    );

    if(!list) return;

    try{

        const res =
        await fetch(
        "http://localhost:5000/events"
        );

        const events =
        await res.json();

        list.innerHTML = "";

        events.forEach(event=>{

            list.innerHTML += `

            <div class="event-card">

                <h4>
                ${event.title}
                </h4>

                <p>
                ${event.description || ""}
                </p>

            </div>

            `;

        });

    }
    catch(err){

        console.error(err);

    }

}

/* =========================
   LOAD JOBS
========================= */

async function loadJobs(){

    const list =
    document.getElementById(
    "jobList"
    );

    if(!list) return;

    try{

        const res =
        await fetch(
        "http://localhost:5000/jobs"
        );

        const jobs =
        await res.json();

        list.innerHTML = "";

        jobs.forEach(job=>{

            list.innerHTML += `

            <div class="job-card">

                <h4>
                ${job.title}
                </h4>

                <p>
                ${job.company}
                </p>

                <p>
                ${job.location}
                </p>

            </div>

            `;

        });

    }
    catch(err){

        console.error(err);

    }

}

/* =========================
   UPLOAD PROFILE PHOTO
========================= */

async function uploadPhoto(){

    const file =
    document.getElementById(
    "photoInput"
    )?.files[0];

    if(!file){

        alert(
        "Select a photo"
        );

        return;

    }

    const formData =
    new FormData();

    formData.append(
    "photo",
    file
    );

    try{

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
        }

        );

        const data =
        await res.json();

        alert(
        data.message ||
        "Photo Uploaded"
        );

        loadProfile();

    }
    catch(err){

        console.error(err);

    }

}

/* =========================
   LOGOUT
========================= */

function logout(){

    localStorage.removeItem(
    "token"
    );

    window.location.href =
    "alumni-login.html";

}
document.getElementById(
"editProfileBtn"
).onclick = ()=>{

document.getElementById(
"editProfileSection"
).style.display="block";

};

async function updateProfile(){

const user =
JSON.parse(
localStorage.getItem(
"alumniUser"
));

const updatedData = {

company:
document.getElementById(
"editCompany"
).value,

designation:
document.getElementById(
"editDesignation"
).value,

city:
document.getElementById(
"editCity"
).value,

phone:
document.getElementById(
"editPhone"
).value

};

const res =
await fetch(

`/users/update/${user._id}`,

{

method:"PUT",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify(
updatedData
)

}

);

const data =
await res.json();

localStorage.setItem(
"alumniUser",
JSON.stringify(
data.user
)
);

alert(
"Profile Updated"
);

location.reload();

}
document
.getElementById("committeeForm")
.addEventListener("submit", async(e)=>{

    e.preventDefault();

    const memberData = {

        name:
        document.getElementById("committeeName").value,

        designation:
        document.getElementById("committeeDesignation").value,

        email:
        document.getElementById("committeeEmail").value,

        mobile:
        document.getElementById("committeeMobile").value,

        tenure:
        document.getElementById("committeeTenure").value,

        photo:
        document.getElementById("committeePhoto").value

    };

    try{

        const res =
        await fetch(
            "http://localhost:5000/committee",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(memberData)
            }
        );

        const result =
        await res.json();

        console.log(result);

        alert(
            "Committee Member Added Successfully"
        );

        document
        .getElementById("committeeForm")
        .reset();

        loadCommitteeMembers();

    }
    catch(err){

        console.log(err);

        alert("Failed to save member");

    }

});

/* =========================
   INITIAL LOAD
========================= */

loadProfile();
loadAnnouncements();
loadEvents();
loadJobs();