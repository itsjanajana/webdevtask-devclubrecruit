document.addEventListener('DOMContentLoaded', function() {
    // Initialize app with sample data
    let appData = {
        tasks: [
            { 
                id: 1, 
                name: "Complete project proposal", 
                completed: false, 
                date: new Date().toISOString().split('T')[0], // Today's date
                time: "15:00",
                priority: "high", 
                tag: "work", 
                collaborator: "", 
                notes: "Due by EOD" 
            },
            { 
                id: 2, 
                name: "Morning workout", 
                completed: true, 
                date: new Date().toISOString().split('T')[0], // Today's date
                time: "08:00",
                priority: "normal", 
                tag: "health", 
                collaborator: "", 
                notes: "" 
            },
            { 
                id: 3, 
                name: "Dentist appointment", 
                completed: false, 
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow's date
                time: "10:30",
                priority: "high", 
                tag: "personal", 
                collaborator: "", 
                notes: "Bring insurance card" 
            }
        ],
        events: [],
        habits: [],
        tags: [
            { name: "work", color: "#FFA500" },
            { name: "personal", color: "#4CAF50" },
            { name: "health", color: "#2196F3" }
        ],
        productivity: {
            done: 30,
            doing: 20,
            todo: 50
        }
    };

    // DOM Elements
    const elements = {
        todayTasksList: document.getElementById('today-tasks'),
        tomorrowTasksList: document.getElementById('tomorrow-tasks'),
        taskForm: document.getElementById('task-form'),
        editTaskForm: document.getElementById('edit-task-form'),
        editTaskSelect: document.getElementById('edit-task-select'),
        deleteTaskBtn: document.getElementById('delete-task'),
        profileModal: document.getElementById('profile-modal'),
        aboutModal: document.getElementById('about-modal'),
        profileLink: document.getElementById('profile-link'),
        aboutLink: document.getElementById('about-link'),
        closeButtons: document.querySelectorAll('.close'),
        notificationBar: document.querySelector('.notification-bar'),
        timerDisplay: document.getElementById('timer-display'),
        startTimerBtn: document.getElementById('start-timer'),
        pauseTimerBtn: document.getElementById('pause-timer'),
        resetTimerBtn: document.getElementById('reset-timer'),
        timerMinutesInput: document.getElementById('timer-minutes'),
        pieChart: document.getElementById('pie-chart')
    };

    // Timer variables
    let timerInterval;
    let timerSeconds = 25 * 60;
    let isTimerRunning = false;

    // Initialize the app
    init();

    function init() {
        // Update notification bar styling
        elements.notificationBar.style.backgroundColor = '#f0f0f0';
        elements.notificationBar.style.color = '#000';

        renderTasks();
        setupEventListeners();
        updateTaskCounts();
        populateEditTaskDropdown();
        setupPomodoroTimer();
        renderProductivityChart();
    }

    function renderTasks() {
        // Clear existing tasks
        elements.todayTasksList.innerHTML = '';
        elements.tomorrowTasksList.innerHTML = '';

        // Get today's and tomorrow's dates in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        // Filter and render today's tasks
        const todaysTasks = appData.tasks.filter(task => task.date === today);
        todaysTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            elements.todayTasksList.appendChild(taskElement);
        });

        // Filter and render tomorrow's tasks
        const tomorrowsTasks = appData.tasks.filter(task => task.date === tomorrow);
        tomorrowsTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            elements.tomorrowTasksList.appendChild(taskElement);
        });

        // Initialize Sortable for drag and drop on both lists
        new Sortable(elements.todayTasksList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: updateTaskOrder
        });

        new Sortable(elements.tomorrowTasksList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: updateTaskOrder
        });
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.priority}-priority`;
        li.dataset.id = task.id;

        // Format time display if it exists
        const timeDisplay = task.time ? ` <small>(${task.time})</small>` : '';

        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <label>${task.name}${timeDisplay}</label>
            <span class="task-tag ${task.tag}">${task.tag}</span>
            <button class="edit-btn">✏️</button>
            <button class="delete-btn">🗑️</button>
            ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
        `;

        // Add event listeners
        li.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task.id));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
        li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
            toggleTaskComplete(task.id, e.target.checked);
            // Update the task element to reflect completion status
            if (e.target.checked) {
                li.querySelector('label').style.textDecoration = 'line-through';
                li.style.opacity = '0.7';
            } else {
                li.querySelector('label').style.textDecoration = 'none';
                li.style.opacity = '1';
            }
            updateTaskCounts();
        });

        // Style completed tasks
        if (task.completed) {
            li.querySelector('label').style.textDecoration = 'line-through';
            li.style.opacity = '0.7';
        }

        return li;
    }

    function setupEventListeners() {
        // Add new task
        elements.taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const taskName = document.getElementById('task-name').value.trim();
            if (!taskName) return; // Don't add empty tasks
            
            const newTask = {
                id: Date.now(), // Simple unique ID
                name: taskName,
                date: document.getElementById('task-date').value || new Date().toISOString().split('T')[0],
                time: document.getElementById('task-time').value || '',
                priority: document.getElementById('task-priority').value,
                tag: document.getElementById('task-tag').value,
                collaborator: document.getElementById('task-collaborator').value,
                notes: document.getElementById('task-notes').value,
                completed: false
            };

            appData.tasks.push(newTask);
            renderTasks();
            populateEditTaskDropdown();
            updateTaskCounts();
            this.reset();
            
            // Collapse the add task form after submission
            document.querySelector('.add-task .collapsible-header').click();
        });

        // Edit task form
        elements.editTaskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const taskId = parseInt(elements.editTaskSelect.value);
            if (isNaN(taskId)) return;
            updateTask(taskId);
        });

        // Delete task button
        elements.deleteTaskBtn.addEventListener('click', function() {
            const taskId = parseInt(elements.editTaskSelect.value);
            if (isNaN(taskId)) return;
            deleteTask(taskId);
            elements.editTaskForm.reset();
        });

        // Modal controls
        elements.profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            elements.profileModal.style.display = 'block';
        });

        elements.aboutLink.addEventListener('click', function(e) {
            e.preventDefault();
            elements.aboutModal.style.display = 'block';
        });

        elements.closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === elements.profileModal) {
                elements.profileModal.style.display = 'none';
            }
            if (e.target === elements.aboutModal) {
                elements.aboutModal.style.display = 'none';
            }
        });

        // Collapsible sections
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', function() {
                this.parentElement.classList.toggle('active');
            });
        });
    }

    function populateEditTaskDropdown() {
        elements.editTaskSelect.innerHTML = '<option value="">Select task to edit</option>';
        appData.tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = `${task.name} (${task.date})`;
            elements.editTaskSelect.appendChild(option);
        });
    }

    function openEditModal(taskId) {
        const task = appData.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Populate the edit form
        elements.editTaskSelect.value = taskId;
        document.getElementById('edit-task-name').value = task.name;
        document.getElementById('edit-task-date').value = task.date;
        document.getElementById('edit-task-time').value = task.time;
        document.getElementById('edit-task-tag').value = task.tag;
        document.getElementById('edit-task-priority').value = task.priority;
        document.getElementById('edit-task-collaborator').value = task.collaborator;
        document.getElementById('edit-task-notes').value = task.notes;
        
        // Open the edit task section if it's collapsed
        const editSection = document.querySelector('.edit-task');
        if (!editSection.classList.contains('active')) {
            editSection.classList.add('active');
        }
    }

    function updateTask(taskId) {
        const taskIndex = appData.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        appData.tasks[taskIndex] = {
            ...appData.tasks[taskIndex],
            name: document.getElementById('edit-task-name').value,
            date: document.getElementById('edit-task-date').value,
            time: document.getElementById('edit-task-time').value,
            tag: document.getElementById('edit-task-tag').value,
            priority: document.getElementById('edit-task-priority').value,
            collaborator: document.getElementById('edit-task-collaborator').value,
            notes: document.getElementById('edit-task-notes').value
        };

        renderTasks();
        populateEditTaskDropdown();
        updateTaskCounts();
    }

    function deleteTask(taskId) {
        appData.tasks = appData.tasks.filter(task => task.id !== taskId);
        renderTasks();
        populateEditTaskDropdown();
        updateTaskCounts();
    }

    function toggleTaskComplete(taskId, isCompleted) {
        const task = appData.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = isCompleted;
        }
    }

    function updateTaskOrder(event) {
        // This function would handle reordering tasks if you want to persist the order
        // Currently, the order is only visual and won't persist after refresh
        // You could implement this by adding an 'order' property to tasks and updating it here
    }

    function updateTaskCounts() {
        const today = new Date().toISOString().split('T')[0];
        const todaysTasks = appData.tasks.filter(task => task.date === today);
        const totalTasks = todaysTasks.length;
        const completedTasks = todaysTasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        // Update UI elements
        document.getElementById('pending-count').textContent = pendingTasks;
        document.getElementById('notification-count').textContent = pendingTasks > 0 ? pendingTasks : 0;

        // Update progress
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        document.getElementById('goal-progress-fill').style.width = `${progressPercentage}%`;
        document.getElementById('goal-percentage').textContent = `${progressPercentage}%`;
    }

    function setupPomodoroTimer() {
        // Update timer display
        updateTimerDisplay();

        // Event listeners for timer controls
        elements.startTimerBtn.addEventListener('click', startTimer);
        elements.pauseTimerBtn.addEventListener('click', pauseTimer);
        elements.resetTimerBtn.addEventListener('click', resetTimer);
        elements.timerMinutesInput.addEventListener('change', function() {
            timerSeconds = this.value * 60;
            updateTimerDisplay();
        });
    }

    function startTimer() {
        if (!isTimerRunning) {
            isTimerRunning = true;
            timerInterval = setInterval(() => {
                timerSeconds--;
                updateTimerDisplay();
                
                if (timerSeconds <= 0) {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    alert("Time's up! Take a short break.");
                }
            }, 1000);
        }
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }

    function resetTimer() {
        pauseTimer();
        timerSeconds = elements.timerMinutesInput.value * 60;
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        elements.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function renderProductivityChart() {
        const ctx = elements.pieChart.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Done', 'Doing', 'To Do'],
                datasets: [{
                    data: [appData.productivity.done, appData.productivity.doing, appData.productivity.todo],
                    backgroundColor: [
                        '#FFD700', // Gold for Done
                        '#FFA500', // Orange for Doing
                        '#FFE0B2'  // Light orange for To Do
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Update legend text
        document.getElementById('done-text').textContent = `Done (${appData.productivity.done}%)`;
        document.getElementById('doing-text').textContent = `Doing (${appData.productivity.doing}%)`;
        document.getElementById('todo-text').textContent = `To Do (${appData.productivity.todo}%)`;
    }

    // Initialize happiness stars
    const stars = document.querySelectorAll('.happiness-stars i');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.dataset.value);
            stars.forEach((s, index) => {
                if (index < value) {
                    s.classList.add('fas');
                    s.classList.remove('far');
                } else {
                    s.classList.add('far');
                    s.classList.remove('fas');
                }
            });
        });
    });
});

