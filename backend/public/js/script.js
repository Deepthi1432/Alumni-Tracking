// Fetch updates from backend
fetch("http://localhost:5000/events")
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("updateList");
    data.forEach(event => {
      const li = document.createElement("li");
      li.textContent = `${event.title} - ${event.date}`;
      list.appendChild(li);
    });
  });
// Register user
async function registerUser() {
  const res = await fetch("http://localhost:5000/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Deepthi", email: "deepthi@example.com", password: "mypassword" })
  });
  const data = await res.json();
  console.log(data);
}
const passedOutYear =
document.getElementById("passedOutYear");

if(passedOutYear){

    const currentYear =
    new Date().getFullYear();

    for(let year=currentYear;
        year>=1996;
        year--){

        let option =
        document.createElement("option");

        option.value = year;
        option.textContent = year;

        passedOutYear.appendChild(option);
    }
}

const workingStatus =
document.getElementById("workingStatus");

const companyFields =
document.getElementById("companyFields");

if(workingStatus){

    workingStatus.addEventListener(
    "change",
    function(){

        companyFields.style.display =
        this.value==="yes"
        ? "block"
        : "none";

    });
}
// Login user
async function loginUser() {
  const res = await fetch("http://localhost:5000/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "deepthi@example.com", password: "mypassword" })
  });
  const data = await res.json();
  console.log(data);
  localStorage.setItem("token", data.token);
}

// Access protected route
async function getProfile() {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:5000/users/profile", {
    headers: { "Authorization": token }
  });
  const data = await res.json();
  console.log(data);
}
// Register form
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch("http://localhost:5000/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  document.getElementById("registerMsg").textContent = data.message || data.error;
});
// Load profile data
async function loadProfile() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch("http://localhost:5000/users/profile", {
    headers: { "Authorization": token }
  });
  const data = await res.json();

  if (!data.error) {
    document.getElementById("profileName").value = data.name;
    document.getElementById("profileEmail").value = data.email;
    document.getElementById("profile").style.display = "block";
  }
}

// Update profile
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const name = document.getElementById("profileName").value;
  const email = document.getElementById("profileEmail").value;
  const password = document.getElementById("profilePassword").value;

  const res = await fetch("http://localhost:5000/users/profile", {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  document.getElementById("profileMsg").textContent = data.message || data.error;
});

// Logout
function logout() {
  localStorage.removeItem("token");
  document.getElementById("profile").style.display = "none";
  alert("Logged out successfully!");
}

loadProfile();

// Login form
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("http://localhost:5000/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  document.getElementById("loginMsg").textContent = data.message || data.error;

  if (data.token) {
    localStorage.setItem("token", data.token);
  }
});
document.getElementById("messageForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;

  // Example: send to backend (Node.js route)
  const res = await fetch("http://localhost:5000/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, subject, message })
  });

  const data = await res.json();
  document.getElementById("formMsg").textContent = data.message || "Message sent!";
});
document.getElementById("messageForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;

  const res = await fetch("http://localhost:5000/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, subject, message })
  });

  const data = await res.json();
  document.getElementById("formMsg").textContent = data.message || data.error;
});
// Load committee members
async function loadCommittee() {
  const res = await fetch("http://localhost:5000/committee");
  const members = await res.json();
  const container = document.getElementById("committeeContainer");
  container.innerHTML = "";

  members.forEach(m => {
    const div = document.createElement("div");
    div.className = "committee-card";
    div.innerHTML = `
      <img src="${m.photoUrl || 'default.jpg'}" alt="${m.name}">
      <h3>${m.name}</h3>
      <p>${m.position}</p>
      <p>${m.email}</p>
      <p>${m.phone}</p>
      <p>${m.tenure}</p>
    `;
    container.appendChild(div);
  });
}
loadCommittee();
document.getElementById("alumniForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const alumni = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    admissionNumber: document.getElementById("admissionNumber").value,
    branch: document.getElementById("branch").value,
    passedOutYear: document.getElementById("passedOutYear").value,
    presentWorking: document.getElementById("presentWorking").value,
    role: "alumni"
  };

  const res = await fetch("http://localhost:5000/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alumni)
  });

  const data = await res.json();
  document.getElementById("alumniMsg").textContent = data.message || data.error;
});
// Populate Passed Out Year dropdown
const yearSelect = document.getElementById("passedOutYear");
const currentYear = new Date().getFullYear();
for (let year = 1946; year <= currentYear; year++) {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = year;
  yearSelect.appendChild(option);
}

// Show/hide working fields
document.querySelectorAll("input[name='workingStatus']").forEach(radio => {
  radio.addEventListener("change", () => {
    const workingFields = document.getElementById("workingFields");
    if (radio.value === "yes" && radio.checked) {
      workingFields.style.display = "block";
    } else {
      workingFields.style.display = "none";
    }
  });
});

// Alumni Register
document.getElementById("alumniForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const alumni = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    admissionNumber: document.getElementById("admissionNumber").value,
    branch: document.getElementById("branch").value,
    passedOutYear: document.getElementById("passedOutYear").value,
    workingStatus: document.querySelector("input[name='workingStatus']:checked").value,
    designation: document.getElementById("designation").value,
    companyName: document.getElementById("companyName").value,
    place: document.getElementById("place").value,
    role: "alumni"
  };

  const res = await fetch("http://localhost:5000/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alumni)
  });

  const data = await res.json();
  document.getElementById("alumniMsg").textContent = data.message || data.error;
});
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("http://localhost:5000/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);

    // Redirect based on role
    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "alumni.html";
    }
  } else {
    alert(data.error);
  }
});
async function loadMarquee() {
  const res = await fetch("http://localhost:5000/admin/announcement");
  const anns = await res.json();
  const marquee = document.getElementById("marquee");
  marquee.textContent = anns.map(a => a.text).join(" | ");
}

loadMarquee();
const socket = io("http://localhost:5000");
let announcements = [];

// Initial load
async function loadMarquee() {
  const res = await fetch("http://localhost:5000/admin/announcement");
  announcements = await res.json();
  updateMarquee();
}

function updateMarquee() {
  const marquee = document.getElementById("marquee");
  marquee.textContent = announcements.map(a => a.text).join(" | ");
}

// Real-time updates
socket.on("announcementUpdate", (data) => {
  if (data.action === "add") {
    announcements.unshift(data.announcement);
  } else if (data.action === "delete") {
    announcements = announcements.filter(a => a._id !== data.id);
  }
  updateMarquee();
});

loadMarquee();
