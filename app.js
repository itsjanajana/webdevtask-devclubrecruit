// ======= GLOBAL STATE =======
const state = {
  tasks: [
    { id: 1, name: "Sample Task 1", done: false, priority: false, tag: "work", date: "2025-06-22", time: "14:00", collaborator: "Jana", notes: "", status: "to do" },
    { id: 2, name: "Sample Task 2", done: true, priority: true, tag: "self", date: "2025-06-22", time: "16:00", collaborator: "", notes: "", status: "done" }
  ],
  habits: [
    { id: 1, name: "Morning Meditation", startDate: "2025-01-01", tag: "self", done: false },
    { id: 2, name: "Drink Water", startDate: "2025-03-01", tag: "health", done: false }
  ],
  events: [
    { id: 1, name: "Jana's Birthday", date: "2025-06-25", tag: "family" },
    { id: 2, name: "Project Deadline", date: "2025-06-30", tag: "work" }
  ],
  notifications: [
    { id: 1, text: "Welcome back! Let's get productive today.", date: new Date() }
  ],
  streak: 0,
  pomodoro: {
    defaultMinutes: 25,
    currentMinutes: 25,
    isRunning: false,
    timerId: null,
    soundOn: false,
    soundType: 'sea'
  },
  quotes: [
    "Productivity is never an accident. It is always the result of a commitment to excellence.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future depends on what you do today.",
    "It's not always that we need to do more but rather that we need to focus on less.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones."
  ],
  selectedQuoteIndex: new Date().getDay() % 7 // for daily quote
};

// ======= DOM ELEMENTS =======
const quoteEl = document.getElementById('quote-of-the-day');
const notificationsBadge = document.getElementById('notifications-badge');
const notificationsList = document.getElementById('notifications-list');
const notificationsContainer = document.getElementById('notifications');
const streakCountEl = document.getElementById('streak-count');

const calendarEl = document.getElementById('calendar');
const pomodoroMinutesEl = document.getElementById('pomodoro-minutes');
const pomodoroStartBtn = document.getElementById('pomodoro-start');
const pomodoroPauseBtn = document.getElementById('pomodoro-pause');
const pomodoroResetBtn = document.getElementById('pomodoro-reset');
const pomodoroSoundToggle = document.getElementById('pomodoro-sound-toggle');
const pomodoroSoundSelect = document.getElementById('pomodoro-sound-select');

const productivityPieEl = document.getElementById('productivity-pie');
const productivityToggleBtns = document.querySelectorAll('.productivity-toggle-btn');

const todayTasksList = document.getElementById('today-tasks-list');
const upcomingEventsList = document.getElementById('upcoming-events-list');
const habitTrackerList = document.getElementById('habit-tracker-list');

const addTaskBtn = document.getElementById('add-task-btn');
const addTaskForm = document.getElementById('add-task-form');

const editTaskForm = document.getElementById('edit-task-form');
const tomorrowTasksList = document.getElementById('tomorrow-tasks-list');
const tomorrowWeekToggleBtn = document.getElementById('tomorrow-week-toggle');

const teamTasksList = document.getElementById('team-tasks-list');
const taskManagerTagsList = document.getElementById('task-manager-tags-list');

// ======= INITIALIZATION =======

function init() {
  // Show daily quote
  quoteEl.textContent = state.quotes[state.selectedQuoteIndex];

  // Show streak (load from localStorage)
  loadStreak();

  // Show notifications count
  updateNotifications();

  // Render calendar
  renderCalendar(new Date());

  // Render productivity pie (daily default)
  renderProductivityPie('daily');

  // Render task lists
  renderTodayTasks();
  renderUpcomingEvents();
  renderHabitTracker();
  renderTomorrowTasks();
  renderTeamTasks();
  renderTaskManagerTags();

  // Attach event listeners
  setupEventListeners();

  // Update streak on visit
  updateStreak();
}

// ======= STREAK LOGIC =======
function loadStreak() {
  const streakData = localStorage.getItem('streakData');
  if(streakData){
    const parsed = JSON.parse(streakData);
    const lastVisit = new Date(parsed.lastVisit);
    const today = new Date();
    // Check if yesterday or today
    const diffDays = Math.floor((today - lastVisit) / (1000*60*60*24));
    if(diffDays === 1){
      state.streak = parsed.streak + 1;
    } else if(diffDays > 1){
      state.streak = 1; // Reset streak
    } else {
      state.streak = parsed.streak; // same day, no change
    }
  } else {
    state.streak = 1; // first visit
  }
  streakCountEl.textContent = state.streak;
  localStorage.setItem('streakData', JSON.stringify({ streak: state.streak, lastVisit: new Date() }));
}

function updateStreak() {
  streakCountEl.textContent = state.streak;
}

// ======= NOTIFICATIONS =======
function updateNotifications() {
  // Set badge count
  notificationsBadge.textContent = state.notifications.length;

  // Render notifications list
  notificationsList.innerHTML = '';
  state.notifications.forEach(note => {
    const div = document.createElement('div');
    div.textContent = note.text;
    div.style.padding = '5px 0';
    div.style.borderBottom = '1px solid #ddd';
    notificationsList.appendChild(div);
  });
}

notificationsContainer.addEventListener('click', () => {
  notificationsList.classList.toggle('show');
});

// ======= CALENDAR =======
function renderCalendar(date) {
  // Simple calendar month view with red circle on today's date
  // For demo, will just show month and year
  const year = date.getFullYear();
  const month = date.getMonth();

  calendarEl.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
      <button id="prev-month-btn">&lt;</button>
      <div>${date.toLocaleString('default', { month: 'long' })} ${year}</div>
      <button id="next-month-btn">&gt;</button>
      <select id="year-dropdown">
        ${Array.from({length: 10}, (_, i) => `<option value="${year - 5 + i}" ${year - 5 + i === year ? 'selected' : ''}>${year - 5 + i}</option>`).join('')}
      </select>
    </div>
  `;

  // TODO: Add days grid with red circle on today's date

  // Attach month buttons listeners
  document.getElementById('prev-month-btn').onclick = () => {
    let newDate = new Date(date);
    newDate.setMonth(month - 1);
    renderCalendar(newDate);
  };

  document.getElementById('next-month-btn').onclick = () => {
    let newDate = new Date(date);
    newDate.setMonth(month + 1);
    renderCalendar(newDate);
  };

  document.getElementById('year-dropdown').onchange = (e) => {
    let newYear = parseInt(e.target.value);
    let newDate = new Date(date);
    newDate.setFullYear(newYear);
    renderCalendar(newDate);
  };
}

// ======= POMODORO TIMER =======
// For brevity, only basic logic without actual timer here

let pomodoroTimer = null;
let pomodoroRemaining = state.pomodoro.currentMinutes * 60;

function startPomodoro() {
  if(pomodoroTimer) return;
  pomodoroTimer = setInterval(() => {
    if(pomodoroRemaining <= 0) {
      clearInterval(pomodoroTimer);
      pomodoroTimer = null;
      alert("Pomodoro complete!");
      pomodoroRemaining = state.pomodoro.currentMinutes * 60;
      updatePomodoroDisplay();
      return;
    }
    pomodoroRemaining--;
    updatePomodoroDisplay();
  }, 1000);
}

function pausePomodoro() {
  clearInterval(pomodoroTimer);
  pomodoroTimer = null;
}

function resetPomodoro() {
  pausePomodoro();
  pomodoroRemaining = state.pomodoro.currentMinutes * 60;
  updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
  let minutes = Math.floor(pomodoroRemaining / 60);
  let seconds = pomodoroRemaining % 60;
  pomodoroMinutesEl.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

// Attach pomodoro button handlers
pomodoroStartBtn.addEventListener('click', startPomodoro);
pomodoroPauseBtn.addEventListener('click', pausePomodoro);
pomodoroResetBtn.addEvent
