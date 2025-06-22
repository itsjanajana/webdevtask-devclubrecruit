// ===== GLOBAL STATE =====
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
let streak = Number(localStorage.getItem('streak')) || 0;

let pomodoro = {
  duration: 25 * 60, // in seconds
  timeLeft: 25 * 60,
  timerId: null,
  isRunning: false,
  soundOn: false,
  soundType: 'rain',
};

// ===== HELPERS =====
function saveData() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('habits', JSON.stringify(habits));
  localStorage.setItem('notifications', JSON.stringify(notifications));
  localStorage.setItem('streak', streak);
}

function createNotification(message) {
  notifications.push({ message, date: new Date().toISOString() });
  saveData();
  renderNotifications();
  updateNotificationCount();
}

function updateNotificationCount() {
  const countElem = document.getElementById('notif-count');
  if (!countElem) return;
  countElem.textContent = notifications.length > 0 ? notifications.length : '';
}

function renderNotifications() {
  const notifList = document.getElementById('notification-list');
  if (!notifList) return;
  notifList.innerHTML = '';
  notifications.slice(-5).reverse().forEach((n) => {
    const li = document.createElement('li');
    const date = new Date(n.date);
    li.textContent = `${n.message} (${date.toLocaleTimeString()})`;
    notifList.appendChild(li);
  });
}

// ===== POMODORO TIMER =====
function updatePomodoroDisplay() {
  const display = document.getElementById('pomodoro-timer');
  if (!display) return;
  const minutes = Math.floor(pomodoro.timeLeft / 60).toString().padStart(2, '0');
  const seconds = (pomodoro.timeLeft % 60).toString().padStart(2, '0');
  display.textContent = `${minutes}:${seconds}`;
}

function pomodoroTick() {
  if (pomodoro.timeLeft > 0) {
    pomodoro.timeLeft--;
    updatePomodoroDisplay();
  } else {
    clearInterval(pomodoro.timerId);
    pomodoro.isRunning = false;
    createNotification('Pomodoro finished! Time to take a break.');
    // Add sound playing logic here later if soundOn true
  }
}

function startPomodoro() {
  if (!pomodoro.isRunning) {
    pomodoro.timerId = setInterval(pomodoroTick, 1000);
    pomodoro.isRunning = true;
  }
}

function pausePomodoro() {
  clearInterval(pomodoro.timerId);
  pomodoro.isRunning = false;
}

function resetPomodoro() {
  clearInterval(pomodoro.timerId);
  pomodoro.timeLeft = pomodoro.duration;
  pomodoro.isRunning = false;
  updatePomodoroDisplay();
}

// ===== TASKS =====
function renderTasks() {
  const taskList = document.getElementById('today-tasks');
  if (!taskList) return;
  taskList.innerHTML = '';

  // Sort: incomplete first, completed last
  tasks.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

  tasks.forEach((task, i) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) li.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
      tasks[i].completed = checkbox.checked;
      saveData();
      renderTasks();
      updateStreak();
      // TODO: update productivity chart here
    });
    li.appendChild(checkbox);

    const span = document.createElement('span');
    span.textContent = task.name;
    li.appendChild(span);

    taskList.appendChild(li);
  });
}

// ===== HABITS =====
function renderHabits() {
  const habitList = document.getElementById('habit-list');
  if (!habitList) return;
  habitList.innerHTML = '';

  habits.forEach((habit, i) => {
    const div = document.createElement('div');
    div.className = 'habit-item';
    if (habit.completedToday) div.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = habit.completedToday;
    checkbox.addEventListener('change', () => {
      habits[i].completedToday = checkbox.checked;
      saveData();
      renderHabits();
      updateStreak();
    });
    div.appendChild(checkbox);

    const nameSpan = document.createElement('span');
    nameSpan.textContent = habit.name;
    div.appendChild(nameSpan);

    const sub = document.createElement('small');
    sub.textContent = `Since ${habit.sinceDate || 'N/A'} - Tag: ${habit.tag || 'none'}`;
    div.appendChild(sub);

    habitList.appendChild(div);
  });
}

// ===== STREAK =====
function updateStreak() {
  const allTasksDone = tasks.every((t) => t.completed);
  const allHabitsDone = habits.every((h) => h.completedToday);
  if (allTasksDone && allHabitsDone && tasks.length > 0) {
    streak++;
  } else {
    streak = 0;
  }
  saveData();
  renderStreak();
}

function renderStreak() {
  const streakElem = document.getElementById('streak-count');
  if (streakElem) streakElem.textContent = `🔥 Streak: ${streak}`;
}

// ===== INITIALIZE =====
function init() {
  renderTasks();
  renderHabits();
  renderStreak();
  updatePomodoroDisplay();
  renderNotifications();
  updateNotificationCount();

  // Pomodoro buttons
  document.getElementById('pomodoro-start')?.addEventListener('click', startPomodoro);
  document.getElementById('pomodoro-pause')?.addEventListener('click', pausePomodoro);
  document.getElementById('pomodoro-reset')?.addEventListener('click', resetPomodoro);
  document.getElementById('pomodoro-sound-toggle')?.addEventListener('click', () => {
    pomodoro.soundOn = !pomodoro.soundOn;
    document.getElementById('pomodoro-sound-toggle').textContent = pomodoro.soundOn ? 'Sound: On' : 'Sound: Off';
  });
  document.getElementById('pomodoro-sound-select')?.addEventListener('change', (e) => {
    pomodoro.soundType = e.target.value;
  });

  // Sample welcome notification
  createNotification('Welcome to your To-Do List!');
}

window.onload = init;
