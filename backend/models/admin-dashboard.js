const token =
localStorage.getItem(
"adminToken"
);

async function loadAlumni(){

const name =
document.getElementById(
"searchName"
).value;

const res =
await fetch(

`http://localhost:5000/admin/alumni?name=${name}`,

{
headers:{
Authorization:token
}
}

);

const alumni =
await res.json();

const table =
document.getElementById(
"alumniTable"
);

table.innerHTML="";

alumni.forEach(a=>{

table.innerHTML += `

<tr>

<td>
${a.firstName}
${a.lastName}
</td>

<td>
${a.email}
</td>

<td>
${a.department}
</td>

<td>
${a.passedOutYear}
</td>

<td>

<button
onclick="deleteAlumni('${a._id}')">

Delete

</button>

</td>

</tr>

`;

});

document.getElementById(
"totalAlumni"
).textContent =
alumni.length;

}

async function deleteAlumni(id){

if(!confirm("Delete Alumni?"))
return;

await fetch(

`http://localhost:5000/admin/alumni/${id}`,

{
method:"DELETE",

headers:{
Authorization:token
}
}

);

loadAlumni();

}

async function addAnnouncement(){

const text =
document.getElementById(
"announcementText"
).value;

await fetch(

"http://localhost:5000/announcements",

{
method:"POST",

headers:{
"Content-Type":
"application/json",

Authorization:
token
},

body:JSON.stringify({
text
})

}

);

alert("Announcement Added");

}

async function uploadImage(){

const file =
document.getElementById(
"galleryImage"
).files[0];

const formData =
new FormData();

formData.append(
"image",
file
);

await fetch(

"http://localhost:5000/gallery",

{
method:"POST",

headers:{
Authorization:
token
},

body:formData
}

);

alert(
"Image Uploaded"
);

}

loadAlumni();
document
.getElementById("committeeForm")
?.addEventListener(
"submit",
async(e)=>{

    e.preventDefault();

    const member = {

        name:
        document.getElementById(
        "memberName"
        ).value,

        designation:
        document.getElementById(
        "memberDesignation"
        ).value,

        photo:
        document.getElementById(
        "memberPhoto"
        ).value

    };

    const res =
    await fetch(
    "http://localhost:5000/committee",
    {
        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify(
        member
        )
    });

    const data =
    await res.json();

    alert(data.message);

    e.target.reset();

});