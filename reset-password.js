async function resetPassword(){

const token =
new URLSearchParams(
window.location.search
).get("token");

const res =
await fetch(
"/users/reset-password",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

token,

password:
document.getElementById(
"newPassword"
).value

})

}

);

const data =
await res.json();

alert(
data.message
);

window.location.href =
"alumni-login.html";

}