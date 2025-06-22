// -------------------------
// 1️⃣ Quote of the Day 
// -------------------------

const quotes = [
  "Believe you can and you're halfway there.",
  "Productivity is never an accident.",
  "Small steps every day.",
  "Focus on being productive, not busy.",
  "Dream big. Start small. Act now.",
  "Work smarter, not harder.",
  "Consistency is key to success."
];

let quoteIndex = 0;
setInterval(() => {
  const quoteElement = document.getElementById("quote");
  if (quoteElement) {
    quoteElement.innerText = quotes[quoteIndex];
    quoteIndex = (quoteIndex + 1) % quotes.length;
  }
}, 2000); // Changes every 2 seconds for nice blinking effect

// -------------------------
// 2️⃣ Profile Login 
// -------------------------

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (username === "Jana" && password === "harrypotter") {
        alert("Login successful!");
        window.location.href = "index.html";
      } else {
        alert("Invalid credentials. Try again.");
      }
    });
  }
});

// -------------------------
// 3️⃣ Task Management 
// -------------------------

let tasks = [];

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

if (addTaskBtn) {
  addTaskBtn.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (taskText !== "") {
      const newTask = {
        id: Date.now(),
        text: taskText,
        done: false
      };
      tasks.push(newTask);
      renderTasks();
      taskInput.value = "";
    }
  });
}

function renderTasks() {
  if (taskList) {
    taskList.innerHTML = "";
    tasks.forEach(task => {
      const li = document.createElement("li");
      li.innerHTML = `
        <input type="checkbox" ${task.done ? "checked" : ""} data-id="${task.id}">
        <span style="${task.done ? "text-decoration: line-through; font-style: italic;" : ""}">${task.text}</span>
        <button data-id="${task.id}" class="deleteBtn">❌</button>
      `;
      taskList.appendChild(li);
    });

    // Add event listeners for new elements
    document.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.target.getAttribute("data-id"));
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
      });
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener("change", (e) => {
        const id = Number(e.target.getAttribute("data-id"));
        tasks = tasks.map(t => {
          if (t.id === id) t.done = !t.done;
          return t;
        });
        renderTasks();
      });
    });
  }
}

// -------------------------
// 4️⃣ Pomodoro Timer 
// -------------------------

let timer;
let timeLeft = 25 * 60; // 25 min default

const timerDisplay = document.getElementById("timerDisplay");
const startBtn = document.getElementById("startTimer");
const pauseBtn = document.getElementById("pauseTimer");
const resetBtn = document.getElementById("resetTimer");

if (startBtn && pauseBtn && resetBtn && timerDisplay) {
  updateTimerDisplay();

  startBtn.addEventListener("click", () => {
    if (!timer) {
      timer = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateTimerDisplay();
        } else {
          clearInterval(timer);
          timer = null;
          alert("Time's up!");
        }
      }, 1000);
    }
  });

  pauseBtn.addEventListener("click", () => {
    clearInterval(timer);
    timer = null;
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(timer);
    timer = null;
    timeLeft = 25 * 60;
    updateTimerDisplay();
  });
}

function updateTimerDisplay() {
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  timerDisplay.innerText = `${mins}:${secs}`;
}

// -------------------------
// 5️⃣ Sound Toggle (Placeholder)
// -------------------------

const soundToggle = document.getElementById("soundToggle");
if (soundToggle) {
  soundToggle.addEventListener("change", (e) => {
    if (e.target.checked) {
      alert("Sound ON - You can add rain/sea/forest audio logic here.");
    } else {
      alert("Sound OFF");
    }
  });
}

// -------------------------
// ✅ All basic features in one file!
// -------------------------
