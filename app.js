// ================================
// Data Structures & State
// ================================
const tasks = [];
const friends = [];

let pomodoroInterval = null;
let pomodoroTimeLeft = 25 * 60; // 25 minutes in seconds
let pomodoroRunning = false;

// ================================
// Helpers
// ================================

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(dateStr) {
  // Format yyyy-mm-dd
  return new Date(dateStr + "T00:00:00");
}

function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}

function getTodayStr() {
  return formatDate(new Date());
}

function getTomorrowStr() {
  let d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDate(d);
}

function getWeekStart() {
  const d = new Date();
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day + 1); // Monday start
  return d;
}

function getWeekEnd() {
  const d = getWeekStart();
  d.setDate(d.getDate() + 6);
  return d;
}

// ================================
// Task Functions
// ================================

function addTask(name, date = null, time = null) {
  if (!name.trim()) return false;
  const id = Date.now().toString() + Math.random().toString(36).slice(2,7);
  const dueDate = date ? new Date(date) : null;
  tasks.push({
    id,
    name,
    date: dueDate,
    time: time || null,
    completed: false,
    priority: 0 // can extend to support priority
  });
  renderAll();
  return true;
}

function editTask(id, newName, newDate = null, newTime = null) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    if (newName.trim()) task.name = newName;
    task.date = newDate ? new Date(newDate) : null;
    task.time = newTime || null;
    renderAll();
  }
}

function deleteTask(id) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    tasks.splice(idx, 1);
    renderAll();
  }
}

function toggleTaskCompletion(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    // Move completed tasks to bottom by sorting or filtering when rendering
    renderAll();
  }
}

function tasksForDate(dateStr) {
  return tasks.filter(t => {
    if (!t.date) return false;
    return formatDate(t.date) === dateStr;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1; // incomplete first
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });
}

function tasksForTomorrow() {
  return tasksForDate(getTomorrowStr());
}

function tasksForToday() {
  return tasksForDate(getTodayStr());
}

function tasksForWeek() {
  const start = getWeekStart();
  const end = getWeekEnd();
  return tasks.filter(t => {
    if (!t.date) return false;
    return t.date >= start && t.date <= end;
  }).sort((a,b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.date && b.date) {
      if (a.date.getTime() !== b.date.getTime()) return a.date - b.date;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    }
    return 0;
  });
}

// ================================
// Render Functions
// ================================

// Utility for creating an element with classes and text
function createEl(tag, classes = [], text = '') {
  const el = document.createElement(tag);
  if (classes.length) el.classList.add(...classes);
  if (text) el.textContent = text;
  return el;
}

// Render task list inside a container
function renderTaskList(containerId, taskArray, showDate = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (taskArray.length === 0) {
    const noTasks = createEl('p', [], 'No tasks.');
    container.appendChild(noTasks);
    return;
  }
  const ul = createEl('ul', ['task-list']);
  taskArray.forEach(task => {
    const li = createEl('li', [task.completed ? 'completed' : '']);
    // Checkbox
    const checkbox = createEl('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
    li.appendChild(checkbox);

    // Task name
    const nameSpan = createEl('span', ['task-name'], task.name);
    li.appendChild(nameSpan);

    // Date/time subtitle
    if (showDate && task.date) {
      const dateStr = task.date.toLocaleDateString();
      const timeStr = task.time ? ' ' + task.time : '';
      const subtitle = createEl('span', ['task-date'], dateStr + timeStr);
      li.appendChild(subtitle);
    }

    // Edit and Delete buttons
    const editBtn = createEl('button', [], 'Edit');
    editBtn.style.marginLeft = '10px';
    editBtn.addEventListener('click', () => openEditTaskModal(task));
    li.appendChild(editBtn);

    const delBtn = createEl('button', ['delete-btn'], 'Delete');
    delBtn.addEventListener('click', () => deleteTask(task.id));
    li.appendChild(delBtn);

    ul.appendChild(li);
  });
  container.appendChild(ul);
}

// Render daily timeline with tasks sorted by time
function renderDailyTimeline() {
  const container = document.getElementById('daily-timeline');
  container.innerHTML = '';
  // Show each hour slot 0 to 23
  for (let h = 0; h < 24; h++) {
    const hourBlock = createEl('div', ['hour-block']);
    hourBlock.style.borderBottom = '1px solid #ddd';
    hourBlock.style.padding = '5px 10px';
    hourBlock.style.minHeight = '40px';
    hourBlock.style.position = 'relative';
    hourBlock.style.fontSize = '12px';
    hourBlock.style.color = '#666';
    hourBlock.textContent = (h < 10 ? '0' + h : h) + ':00';

    // Tasks for this hour
    const tasksThisHour = tasksForToday().filter(t => {
      if (!t.time) return false;
      const taskHour = parseInt(t.time.split(':')[0], 10);
      return taskHour === h;
    });

    tasksThisHour.forEach(task => {
      const taskEl = createEl('div', ['timeline-task'], task.name);
      taskEl.style.background = task.completed ? '#cce5cc' : '#a8d0ff';
      taskEl.style.borderRadius = '4px';
      taskEl.style.padding = '2px 6px';
      taskEl.style.marginTop = '4px';
      taskEl.style.fontSize = '13px';
      taskEl.style.cursor = 'default';
      taskEl.style.color = task.completed ? '#4d774d' : '#003d80';
      hourBlock.appendChild(taskEl);
    });

    container.appendChild(hourBlock);
  }
}

// Render task progress pie chart for today
function renderTaskProgressChart() {
  const canvas = document.getElementById('task-progress-chart');
  const ctx = canvas.getContext('2d');
  const todayTasks = tasksForToday();

  const total = todayTasks.length;
  const completed = todayTasks.filter(t => t.completed).length;
  const remaining = total - completed;

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (total === 0) {
    // No tasks
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('No tasks today', canvas.width/2, canvas.height/2);
    return;
  }

  // Draw pie chart with pastel colors
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 20;

  let startAngle = 0;
  // Completed slice - pastel green
  const completedAngle = (completed / total) * 2 * Math.PI;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, startAngle + completedAngle);
  ctx.closePath();
  ctx.fillStyle = '#a0d468'; // pastel green
  ctx.fill();

  startAngle += completedAngle;

  // Remaining slice - pastel blue
  const remainingAngle = (remaining / total) * 2 * Math.PI;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, startAngle + remainingAngle);
  ctx.closePath();
  ctx.fillStyle = '#5dade2'; // pastel blue
  ctx.fill();

  // Draw circle outline
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#0056b3';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw text in center
  ctx.fillStyle = '#0056b3';
  ctx.font = '18px Merriweather, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${completed} / ${total} done`, centerX, centerY);
}

// ================================
// Pomodoro Timer Functions
// ================================

function updatePomodoroDisplay() {
  const timerEl = document.getElementById('pomodoro-timer');
  const minutes = Math.floor(pomodoroTimeLeft / 60);
  const seconds = pomodoroTimeLeft % 60;
  timerEl.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

function startPomodoro() {
  if (pomodoroRunning) return;
  pomodoroRunning = true;
  pomodoroInterval = setInterval(() => {
    if (pomodoroTimeLeft > 0) {
      pomodoroTimeLeft--;
      updatePomodoroDisplay();
    } else {
      clearInterval(pomodoroInterval);
      pomodoroRunning = false;
      updatePomodoroDisplay();
      playPomodoroSound();
      alert('Pomodoro session ended! Take a break.');
    }
  }, 1000);
}

function pausePomodoro() {
  if (!pomodoroRunning) return;
  clearInterval(pomodoroInterval);
  pomodoroRunning = false;
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroRunning = false;
  pomodoroTimeLeft = 25 * 60;
  updatePomodoroDisplay();
}

function playPomodoroSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1);
}

// ================================
// Friends Functions
// ================================

function addFriend(name) {
  if (!name.trim()) return false;
  const id = Date.now().toString() + Math.random().toString(36).slice(2,7);
  const since = new Date();
  friends.push({ id, name, since });
  renderFriends();
  return true;
}

function deleteFriend(id) {
  const idx = friends.findIndex(f => f.id === id);
  if (idx !== -1) {
    friends.splice(idx, 1);
    renderFriends();
  }
}

function renderFriends() {
  const container = document.getElementById('friend-list');
  container.innerHTML = '';
  if (friends.length === 0) {
    container.textContent = 'No friends added.';
    return;
  }
  const ul = createEl('ul', ['friend-list']);
  friends.forEach(f => {
    const li = createEl('li');
    const nameSpan = createEl('span', ['friend-name'], f.name);
    const sinceSpan = createEl('span', ['friend-since'], 'Since: ' + f.since.toLocaleDateString());
    li.appendChild(nameSpan);
    li.appendChild(sinceSpan);

    const delBtn = createEl('button', ['delete-btn'], 'Delete');
    delBtn.addEventListener('click', () => deleteFriend(f.id));
    li.appendChild(delBtn);

    ul.appendChild(li);
  });
  container.appendChild(ul);
}

// ================================
// Event Handlers for Add Task/Friend Forms
// ================================

function setupAddTaskForm() {
  const form = document.getElementById('add-task-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements['task-name'].value;
    const date = form.elements['task-date'].value;
    const time = form.elements['task-time'].value;
    if (addTask(name, date || null, time || null)) {
      form.reset();
    } else {
      alert('Please enter a task name');
    }
  });
}

function setupAddFriendForm() {
  const form = document.getElementById('add-friend-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements['friend-name'].value;
    if (addFriend(name)) {
      form.reset();
    } else {
      alert('Please enter a friend name');
    }
  });
}

// ================================
// Edit Task Modal
// ================================

function openEditTaskModal(task) {
  const modal = document.getElementById('edit-task-modal');
  const nameInput = modal.querySelector('#edit-task-name');
  const dateInput = modal.querySelector('#edit-task-date');
  const timeInput = modal.querySelector('#edit-task-time');
  const saveBtn = modal.querySelector('#edit-task-save');
  const cancelBtn = modal.querySelector('#edit-task-cancel');

  nameInput.value = task.name;
  dateInput.value = task.date ? formatDate(task.date) : '';
  timeInput.value = task.time || '';

  modal.style.display = 'block';

  function onSave() {
    editTask(task.id, nameInput.value, dateInput.value || null, timeInput.value || null);
    closeEditTaskModal();
  }
  function closeEditTaskModal() {
    modal.style.display = 'none';
    saveBtn.removeEventListener('click', onSave);
    cancelBtn.removeEventListener('click', closeEditTaskModal);
  }

  saveBtn.addEventListener('click', onSave);
  cancelBtn.addEventListener('click', closeEditTaskModal);
}

// ================================
// Tab Navigation
// ================================

function setupTabs() {
  const tabs = document.querySelectorAll('.sidebar a');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = tab.getAttribute('href').substring(1);
      // Show target, hide others
      document.querySelectorAll('.content > div').forEach(div => {
        div.style.display = div.id === target ? 'block' : 'none';
      });
      // Update active link
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (target === 'dashboard') {
        renderAll();
      } else if (target === 'track') {
        renderAll();
      } else if (target === 'friends') {
        renderFriends();
      }
    });
  });
}

// ================================
// Initial Render and Setup
// ================================

function renderAll() {
  // Dashboard tasks = Today tasks list + timeline + pie chart
  renderTaskList('today-tasks-list', tasksForToday());
  renderDailyTimeline();
  renderTaskProgressChart();

  // Track tab = All weekly tasks list with date/time subtitles
  renderTaskList('all-tasks-list', tasksForWeek(), true);
}

function setupPomodoroButtons() {
  document.getElementById('pomodoro-start').addEventListener('click', startPomodoro);
  document.getElementById('pomodoro-pause').addEventListener('click', pausePomodoro);
  document.getElementById('pomodoro-reset').addEventListener('click', resetPomodoro);
}

function setup() {
  setupTabs();
  setupAddTaskForm();
  setupAddFriendForm();
  setupPomodoroButtons();
  renderAll();
  renderFriends();
  updatePomodoroDisplay();

  // Show dashboard tab by default
  document.querySelector('.sidebar a[href="#dashboard"]').click();
}

window.onload = setup;
