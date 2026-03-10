/* Application Logic */

// Fake database (Frontend simulation)
let users = JSON.parse(localStorage.getItem('study_users')) || [];
let currentUser = null;
let activeSubject = "Java";

// Recommendation Data
const topics = {
    "Java-Fresher": ["What is Programming", "Basic Syntax", "Setting up Environment"],
    "Java-Beginner": ["Variables", "Data Types", "Operators", "Loops", "If-Else Statements"],
    "Java-Intermediate": ["Arrays", "Strings", "OOPS Concepts", "Recursion", "Methods"],
    "Java-Advanced": ["Collections Framework", "Multithreading", "File Handling", "JDBC", "Streams"],

    "C-Fresher": ["Introduction to C", "Structure of C Program", "Basic IO"],
    "C-Beginner": ["Control Flow", "Functions", "Basic Pointers"],
    "C-Intermediate": ["Advanced Pointers", "Structures", "Unions", "File Operations"],
    "C-Advanced": ["Memory Management", "Data Structures in C", "Standard Library"],

    "DSA-Fresher": ["What is Algorithms", "Time Complexity", "Space Complexity", "Basic Math for DSA"],
    "DSA-Beginner": ["Arrays", "Linked Lists", "Stacks", "Queues"],
    "DSA-Intermediate": ["Searching Algorithms", "Sorting Algorithms", "Hashing", "Trees"],
    "DSA-Advanced": ["Graphs", "Dynamic Programming", "Backtracking", "Divide and Conquer"]
};

// --- Initialization ---
window.onload = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
};

// --- UI Switches ---
function showSignup() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("signupForm").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("signupForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}

function showDashboard() {
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("dashboardScreen").classList.remove("hidden");

    const userBadge = document.getElementById("userName");
    userBadge.textContent = currentUser.name;
    userBadge.style.animation = "fadeInUp 0.5s ease-out";

    renderSubjectGrid();
    updateStats();
    recommend(); // Load default recommendations
}

function renderSubjectGrid() {
    const grid = document.getElementById("subjectGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const subjects = [
        { id: "Java", name: "Java Programming", icon: "☕" },
        { id: "C", name: "C Language", icon: "🛠️" },
        { id: "DSA", name: "Data Structures", icon: "📊" }
    ];

    subjects.forEach(subj => {
        let totalCount = 0;
        for (const key in topics) {
            if (key.startsWith(subj.id + "-")) {
                totalCount += topics[key].length;
            }
        }

        const card = document.createElement("div");
        card.className = `subject-item-card ${activeSubject === subj.id ? 'active' : ''}`;
        card.innerHTML = `
            <span class="icon">${subj.icon}</span>
            <span class="name">${subj.name}</span>
            <span class="topic-count">${totalCount} Topics available</span>
        `;
        card.onclick = () => {
            activeSubject = subj.id;
            renderSubjectGrid();
        };
        grid.appendChild(card);
    });
}

// --- Auth Functions ---
function signup() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    if (users.some(u => u.email === email)) {
        alert("User already exists!");
        return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('study_users', JSON.stringify(users));

    alert("Account created successfully! Please login.");
    showLogin();
}

function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard();
    } else {
        alert("Invalid email or password!");
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    document.getElementById("dashboardScreen").classList.add("hidden");
    document.getElementById("authScreen").classList.remove("hidden");
}

// --- Recommendation Logic ---
function recommend() {
    const subject = activeSubject;
    const level = document.getElementById("level").value;
    const completedInput = document.getElementById("completed").value;

    const completed = completedInput
        .split(",")
        .map(x => x.trim().toLowerCase())
        .filter(x => x !== "");

    const key = `${subject}-${level}`;
    const allTopics = topics[key] || [];
    const filtered = allTopics.filter(t => !completed.includes(t.toLowerCase()));

    // Calculate Progress
    const total = allTopics.length;
    const done = total - filtered.length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    updateProgressBar(percent);
    updateStats();
    displayRecommendations(filtered);
}

function updateStats() {
    let totalTopics = 0;
    let completedCount = 0;

    const completedInput = document.getElementById("completed").value;
    const completedArr = completedInput
        .split(",")
        .map(x => x.trim().toLowerCase())
        .filter(x => x !== "");

    // Count globally across all subjects
    for (const key in topics) {
        topics[key].forEach(t => {
            totalTopics++;
            if (completedArr.includes(t.toLowerCase())) {
                completedCount++;
            }
        });
    }

    document.getElementById("statTotal").textContent = totalTopics;
    document.getElementById("statDone").textContent = completedCount;
    document.getElementById("statLeft").textContent = (totalTopics - completedCount);
}

function downloadPlan() {
    const subject = activeSubject;
    const level = document.getElementById("level").value;
    const recommendationsArea = document.getElementById("recommendations");

    // Get currently displayed topics
    const cards = recommendationsArea.querySelectorAll(".topic-card h3");
    let topicList = Array.from(cards).map(c => `- ${c.textContent}`).join("\n");

    if (!topicList) {
        alert("No recommendations to download. Complete topics first!");
        return;
    }

    const content = `STUDY PATH PLAN FOR ${currentUser.name.toUpperCase()}\n` +
        `Subject: ${subject} | Stage: ${level}\n` +
        `Generated on: ${new Date().toLocaleDateString()}\n` +
        `---------------------------------------\n\n` +
        `TOPICS TO COVER:\n${topicList}\n\n` +
        `Keep learning! 🚀`;

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Study_Plan_${subject}_${level}.txt`;
    link.click();
}

function updateProgressBar(percent) {
    const fill = document.getElementById("progressFill");
    const text = document.getElementById("progressText");
    if (fill && text) {
        fill.style.width = `${percent}%`;
        text.textContent = `${percent}% Completed`;
    }
}

function displayRecommendations(recList) {
    const container = document.getElementById("recommendations");
    container.innerHTML = "";

    if (recList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i>🎉</i>
                <h3>All topics completed!</h3>
                <p>Great job! Try another subject or level to keep learning.</p>
            </div>
        `;
        return;
    }

    const grid = document.createElement("div");
    grid.className = "topic-grid";

    recList.forEach(topic => {
        const card = document.createElement("div");
        card.className = "topic-card";
        card.innerHTML = `<h3>${topic}</h3>`;
        card.onclick = () => markAsDone(topic);
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

function markAsDone(topic) {
    const textarea = document.getElementById("completed");
    let val = textarea.value.trim();

    if (val === "") {
        textarea.value = topic;
    } else {
        const existing = val.split(",").map(t => t.trim().toLowerCase());
        if (!existing.includes(topic.toLowerCase())) {
            textarea.value = val + ", " + topic;
        }
    }
    recommend();
}

function clearCompleted() {
    document.getElementById("completed").value = "";
    recommend();
}
