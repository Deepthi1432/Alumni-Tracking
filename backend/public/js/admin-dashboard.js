const token = localStorage.getItem("adminToken");
const API_BASE_URL = "http://localhost:5000"; 
/* =========================
CHECK LOGIN
========================= */
if (!token) {
    alert("Please login first");
    window.location.href = "admin-login.html";
}
// Update your frontend fetch path to include the /admin prefix:
/* =========================
LOAD ALUMNI
========================= */
async function loadAlumni() {
    try {
        const res = await fetch("http://localhost:5000/users");

        const alumni = await res.json();

        const table = document.getElementById("alumniTable");

        if (table) {
            table.innerHTML = "";

            alumni.forEach(a => {
                table.innerHTML += `
                <tr>
                    <td>${a.firstName || ""} ${a.lastName || ""}</td>
                    <td>${a.email || "-"}</td>
                    <td>${a.department || "-"}</td>
                    <td>${a.passedOutYear || "-"}</td>
                    <td>${a.company || "-"}</td>
                    <td>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn" onclick="deleteAlumni('${a._id}')">Delete</button>
                    </td>
                </tr>`;
            });
        }

        document.getElementById("totalAlumni").textContent =
            alumni.length;

    } catch (err) {
        console.error("Load Alumni Error:", err);
    }
}

/* =========================
DELETE ALUMNI
========================= */
async function deleteAlumni(id) {
    const confirmDelete = confirm("Delete this alumni?");
    if (!confirmDelete) return;

    try {
        await fetch(`http://localhost:5000/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: token }
        });
        loadAlumni();
    } catch (err) {
        console.error(err);
    }
}

/* =========================
SEARCH ALUMNI (Client-Side Table Filter)
========================= */
document.getElementById("searchInput")?.addEventListener("keyup", function () {
    const value = this.value.toLowerCase();
    const rows = document.querySelectorAll("#alumniTable tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
    });
});

/* =========================
🌟 NEW: DYNAMIC PLACEMENT INSIGHTS SEARCH (Server-Side Filter)
========================= */
async function loadPlacementSearch() {
    const branch = document.getElementById("placementBranch")?.value || "";
    const year = document.getElementById("placementYear")?.value || "";
    const company = document.getElementById("placementCompany")?.value || "";

    try {
        const queryParams = new URLSearchParams();
        if (branch) queryParams.append("branch", branch);
        if (year) queryParams.append("year", year);
        if (company) queryParams.append("company", company);

        // Path changed to /admin/ and Token header added
        const res = await fetch(`http://localhost:5000/admin/placement-search?${queryParams.toString()}`, {
            headers: { Authorization: token } 
        });
        
        if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);

        const records = await res.json();
        
        const placementContainer = document.getElementById("placementResultsTable");
        if (placementContainer) {
            placementContainer.innerHTML = "";
            if (records.length === 0) {
                placementContainer.innerHTML = `<tr><td colspan="5" style="text-align:center;">No matching placement entries found.</td></tr>`;
                return;
            }

            records.forEach(alumni => {
                placementContainer.innerHTML += `
                <tr>
                    <td><strong>${alumni.firstName} ${alumni.lastName || ""}</strong></td>
                    <td>${alumni.department || alumni.course || "-"}</td>
                    <td>${alumni.passedOutYear || "-"}</td>
                    <td>${alumni.company || "-"}</td>
                    <td><span class="badge">${alumni.designation || "Employee"}</span></td>
                </tr>`;
            });
        }
    } catch (error) {
        console.error("Failed to execute backend query placement search:", error.message);
    }
}

/* =========================
LOAD DASHBOARD STATS
========================= */
async function loadStats() {
    try {
        const res = await fetch("http://localhost:5000/users");

        const alumni = await res.json();

        document.getElementById("totalAlumni").textContent =
            alumni.length;

    } catch (err) {
        console.error("Stats Error:", err);
    }
}
// Example of the synchronized request for events
async function updateEvent(id, updatedData) {
     const res = await fetch("http://localhost:5000/admin/events", {
    method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("adminToken") 
        },
        body: JSON.stringify(updatedData)
    });
    return await res.json();
}
/* =========================
EVENTS FORM INTERACTION
========================= */
document.getElementById("eventForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const event = {
        title: document.getElementById("eventTitle").value,
        description: document.getElementById("eventDescription").value,
        date: document.getElementById("eventDate").value,
        venue: document.getElementById("eventVenue").value
    };

    const res = await fetch("http://localhost:5000/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event)
    });
    const data = await res.json();
    alert(data.message || "Event Created!");
    e.target.reset();
});

/* =========================
GALLERY FORM INTERACTION (With Multi-part Binary Upload Support)
========================= */
document.getElementById("galleryForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", document.getElementById("galleryTitle").value);
    
    const fileInput = document.getElementById("galleryImage");
    if (fileInput && fileInput.files[0]) {
        formData.append("image", fileInput.files[0]);
    }

    const res = await fetch("http://localhost:5000/gallery", {
        method: "POST",
        body: formData
    });
    const data = await res.json();
    alert(data.message || "Gallery Item Saved Successfully");
    e.target.reset();
});

/* =========================
LOAD ANALYTICS (Charts)
========================= */
async function loadAnalytics() {
    try {
        const res = await fetch("http://localhost:5000/users", {
            headers: { Authorization: token }
        });
        const alumni = await res.json();

        /* --- PASSED OUT YEAR CHART --- */
        const yearData = {};
        alumni.forEach(a => {
            const year = a.passedOutYear || "Unknown";
            yearData[year] = (yearData[year] || 0) + 1;
        });

        const yearChartEl = document.getElementById("yearChart");
        if (yearChartEl) {
            new Chart(yearChartEl, {
                type: "bar",
                data: {
                    labels: Object.keys(yearData),
                    datasets: [{
                        label: "Alumni by Year",
                        data: Object.values(yearData)
                    }]
                }
            });
        }

        /* --- COMPANY CHART --- */
        const companyData = {};
        alumni.forEach(a => {
            const company = a.company || "Unknown";
            companyData[company] = (companyData[company] || 0) + 1;
        });

        const companyChartEl = document.getElementById("companyChart");
        if (companyChartEl) {
            new Chart(companyChartEl, {
                type: "pie",
                data: {
                    labels: Object.keys(companyData),
                    datasets: [{
                        data: Object.values(companyData)
                    }]
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
}

/* =========================
CONTACT MESSAGES
========================= */
async function loadContacts() {
    try {
        const res = await fetch("http://localhost:5000/contacts");
        const contacts = await res.json();
        const table = document.getElementById("contactTable");
        if (table) {
            table.innerHTML = "";
            contacts.forEach(c => {
                table.innerHTML += `
                <tr>
                    <td>${c.name}</td>
                    <td>${c.email}</td>
                    <td>${c.subject}</td>
                    <td>${c.message}</td>
                </tr>`;
            });
        }
    } catch (err) {
        console.error(err);
    }
}

/* =========================
ANNOUNCEMENTS, JOBS & MAIL
========================= */
document.getElementById("massMailForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const res = await fetch("http://localhost:5000/admin/send-mail", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({
                subject: document.getElementById("mailSubject").value,
                message: document.getElementById("mailMessage").value
            })
        });
        const data = await res.json();
        alert(data.message || data.error);
    } catch (err) { console.error(err); }
});

document.getElementById("announcementForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const announcement = {
        title: document.getElementById("announcementTitle").value,
        message: document.getElementById("announcementMessage").value
    };
    const res = await fetch("http://localhost:5000/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(announcement)
    });
    const data = await res.json();
    alert(data.message);
    e.target.reset();
});

document.getElementById("jobForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const job = {
        title: document.getElementById("jobTitle").value,
        company: document.getElementById("company").value,
        location: document.getElementById("location").value,
        salary: document.getElementById("salary").value,
        applyLink: document.getElementById("applyLink").value,
        description: document.getElementById("jobDescription").value
    };
    const res = await fetch("http://localhost:5000/admin/jobs/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job)
    });
    const data = await res.json();
    alert(data.message);
    e.target.reset();
});

/* =========================
NAVIGATION VIEW TOGGLE SWITCHES
========================= */
function showPage(pageId) {
    document.querySelectorAll(".admin-page").forEach(page => {
        page.style.display = "none";
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = "block";
}

/* =========================
EXCEL SPREADSHEET EXPORTS
========================= */
async function exportAllAlumni() {
    const res = await fetch("http://localhost:5000/users", { headers: { Authorization: token } });
    const alumni = await res.json();
    const worksheet = XLSX.utils.json_to_sheet(alumni);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alumni");
    XLSX.writeFile(workbook, "All_Alumni.xlsx");
}

async function exportDepartmentWise() {
    const dept = prompt("Enter Department:");
    if (!dept) return;
    const res = await fetch("http://localhost:5000/users", { headers: { Authorization: token } });
    const alumni = await res.json();
    const filtered = alumni.filter(a => a.department && a.department.toLowerCase() === dept.toLowerCase());
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, dept);
    XLSX.writeFile(workbook, `${dept}_Alumni.xlsx`);
}

async function exportYearWise() {
    const year = prompt("Enter Passed Out Year:");
    if (!year) return;
    const res = await fetch("http://localhost:5000/users", { headers: { Authorization: token } });
    const alumni = await res.json();
    const filtered = alumni.filter(a => String(a.passedOutYear) === year);
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, year);
    XLSX.writeFile(workbook, `${year}_Alumni.xlsx`);
}

/* =========================
COMMITTEE MANAGEMENT
========================= */

// LOAD committee members into admin table/list
async function loadCommittee() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/committee`, {
            headers: {
                Authorization: token
            }
        });

        const members = await res.json();
        console.log("Committee members:", members);

        const table = document.getElementById("committeeTable");
        if (!table) return;

        table.innerHTML = "";

        if (!Array.isArray(members) || members.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;">No committee members found</td>
                </tr>
            `;
            return;
        }

        members.forEach((member) => {
            const photoUrl = member.photo
                ? `${API_BASE_URL}${member.photo}`
                : "https://via.placeholder.com/80?text=No+Photo";

            table.innerHTML += `
                <tr>
                    <td>
                        <img 
                            src="${photoUrl}" 
                            alt="${member.name}" 
                            width="60" 
                            height="60"
                            style="object-fit:cover; border-radius:8px;"
                            onerror="this.src='https://via.placeholder.com/80?text=No+Photo'"
                        >
                    </td>
                    <td>${member.name || "-"}</td>
                    <td>${member.role || "-"}</td>
                    <td>${member.email || "-"}</td>
                    <td>${member.mobile || "-"}</td>
                    <td>${member.tenure || "-"}</td>
                    <td>
                        <button onclick="deleteCommittee('${member._id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Load Committee Error:", err);
    }
}

/* =========================
ADD COMMITTEE MEMBER
Form fields required:
- committeeName
- committeeRole
- committeeEmail
- committeeMobile
- committeeTenure
- committeePhoto  (type=file)
========================= */
document.getElementById("committeeForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        const formData = new FormData();
        formData.append("name", document.getElementById("committeeName").value);
        formData.append("role", document.getElementById("committeeRole").value);
        formData.append("email", document.getElementById("committeeEmail").value);
        formData.append("mobile", document.getElementById("committeeMobile").value);
        formData.append("tenure", document.getElementById("committeeTenure").value);

        const photoInput = document.getElementById("committeePhoto");
        if (photoInput && photoInput.files[0]) {
            // IMPORTANT: backend expects "photo"
            formData.append("photo", photoInput.files[0]);
        }

        const res = await fetch(`${API_BASE_URL}/admin/committee`, {
            method: "POST",
            headers: {
                Authorization: token
            },
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to add committee member");
        }

        alert(data.message || "Committee member added successfully");
        e.target.reset();
        loadCommittee();
    } catch (err) {
        console.error("Committee Add Error:", err);
        alert(err.message);
    }
});

/* =========================
DELETE COMMITTEE MEMBER
========================= */
async function deleteCommittee(id) {
    const confirmDelete = confirm("Delete this committee member?");
    if (!confirmDelete) return;

    try {
        const res = await fetch(`${API_BASE_URL}/admin/committee/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: token
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to delete committee member");
        }

        alert(data.message || "Committee member deleted successfully");
        loadCommittee();
    } catch (err) {
        console.error("Delete Committee Error:", err);
        alert(err.message);
    }
}

function logout() {
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
}
async function loadCommitteeRoll() {
    const box = document.getElementById("committeeList");
    box.innerHTML = "Compiling board members...";

    try {
        const res = await fetch(`${API_BASE_URL}/admin/committee`);
        
        // Add a check to catch 404/500 errors before parsing JSON
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        
        let roll = await res.json();
        box.innerHTML = "";

        // Sorting: Oldest first (createdAt ascending)
        roll.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        roll.forEach(m => {
    // Determine the source: 
    // If it starts with 'http', use it as-is.
    // Otherwise, treat it as a local filename stored in your uploads folder.
    let imgSrc;
    if (!m.photo || m.photo === "") {
        imgSrc = 'https://via.placeholder.com/150'; // Default if empty
    } else if (m.photo.startsWith('http')) {
        imgSrc = m.photo; // External URL
    } else {
        imgSrc = `${API_BASE_URL}/uploads/${m.photo}`; // Local file
    }

    box.innerHTML += `
        <div class="committee-member-card">
            <img src="${imgSrc}" 
                 alt="Profile of ${m.name || 'Member'}" 
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/150';">
            
            <h4>${m.name || m.memberName || "No Name"}</h4>
            <p style="color:#004080; font-weight:bold; font-size:13px;">
                ${m.role || m.designation || "No Role"}
            </p>
            <button class="delete-btn-generic" onclick="deleteItem('/admin/committee','${m._id}','committeePage')">
                Remove Member
            </button>
        </div>
    `;
});
    } catch (err) {
        console.error("Committee load error:", err);
        box.innerHTML = "<p>Failed to load: ${err.mesage}</p>";
    }
}
// In your dashboard script
// This tells the page to run the function as soon as it loads
document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard loaded, fetching committee data...");
    loadCommitteeRoll();
});
// Locate your existing form submission function in admin-dashboard.js
async function submitCommitteeMember(event) {
    event.preventDefault(); // Stop page refresh

    // 1. Get your data from the form
    const formData = new FormData(event.target);

    try {
        // 2. Send the data to your backend
        const response = await fetch(`${API_BASE_URL}/admin/committee`, {
            method: 'POST',
            body: formData // Or JSON.stringify() if sending JSON
        });

        if (response.ok) {
            alert("Member added successfully!");
            
            // 3. CLEAR THE FORM
            event.target.reset(); 
            
            // 4. CALL THE FUNCTION HERE to refresh the list automatically
            loadCommitteeRoll(); 
        } else {
            alert("Failed to add member.");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}
/* =========================
INITIAL BOOTSTRAP OPERATIONS
========================= */
loadStats();
loadAlumni();
loadAnalytics();
loadContacts();
loadPlacementSearch();
loadCommittee();
if (typeof loadProfile === "function") {
    loadProfile();
}
// Initial rendering call for data metrics lists