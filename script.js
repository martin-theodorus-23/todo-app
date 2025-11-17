const todoValue = document.getElementById("todoText");
const todoAlert = document.getElementById("Alert");
const listItems = document.getElementById("list-items");
const addUpdate = document.getElementById("AddUpdateClick");
const totalTimeDisplay = document.getElementById("totalTime");

let todo = JSON.parse(localStorage.getItem("todo-list"));
if (!todo) {
  todo = [];
}

// Timer variables
let timers = {};
let totalSeconds = parseInt(localStorage.getItem("total-time")) || 0;

// Update total time display
function updateTotalTimeDisplay() {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  totalTimeDisplay.innerText = 
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Format time for display
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Start timer for a task
function startTimer(taskId) {
  const item = todo.find(t => t.id === taskId);
  if (!item || item.timerRunning) return;
  
  item.timerRunning = true;
  setLocalStorage();
  
  timers[taskId] = setInterval(() => {
    const currentItem = todo.find(t => t.id === taskId);
    if (!currentItem) {
      clearInterval(timers[taskId]);
      delete timers[taskId];
      return;
    }
    
    currentItem.timeSpent = (currentItem.timeSpent || 0) + 1;
    totalSeconds++;
    updateTotalTimeDisplay();
    
    // Update the specific timer display
    const timerElement = document.querySelector(`[data-task-id="${taskId}"] .timer-display`);
    if (timerElement) {
      timerElement.innerText = formatTime(currentItem.timeSpent);
    }
    
    setLocalStorage();
    localStorage.setItem("total-time", totalSeconds);
  }, 1000);
  
  updateTimerButtons(taskId);
}

// Pause timer for a task
function pauseTimer(taskId) {
  const item = todo.find(t => t.id === taskId);
  if (!item) return;
  
  item.timerRunning = false;
  setLocalStorage();
  
  if (timers[taskId]) {
    clearInterval(timers[taskId]);
    delete timers[taskId];
  }
  
  updateTimerButtons(taskId);
}

// Reset timer for a task
function resetTimer(taskId) {
  pauseTimer(taskId);
  const item = todo.find(t => t.id === taskId);
  if (!item) return;
  
  const timeToSubtract = item.timeSpent || 0;
  totalSeconds = Math.max(0, totalSeconds - timeToSubtract);
  item.timeSpent = 0;
  item.timerRunning = false;
  
  updateTotalTimeDisplay();
  
  // Update the specific timer display
  const timerElement = document.querySelector(`[data-task-id="${taskId}"] .timer-display`);
  if (timerElement) {
    timerElement.innerText = formatTime(0);
  }
  
  setLocalStorage();
  localStorage.setItem("total-time", totalSeconds);
}

// Remove the old updateTimerDisplay function since we're doing it inline now

// Update timer button states
function updateTimerButtons(taskId) {
  const item = todo.find(t => t.id === taskId);
  if (!item) return;
  
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
  if (!taskElement) return;
  
  const playBtn = taskElement.querySelector('.timer-play');
  const pauseBtn = taskElement.querySelector('.timer-pause');
  
  if (item.timerRunning) {
    playBtn.classList.add('active');
    pauseBtn.classList.remove('active');
  } else {
    playBtn.classList.remove('active');
    pauseBtn.classList.add('active');
  }
}

updateTotalTimeDisplay();

// Handle Enter key press
function handleKeyPress(event) {
  if (event.key === 'Enter' || event.keyCode === 13) {
    event.preventDefault();
    const currentOnclick = addUpdate.getAttribute('onclick');
    if (currentOnclick === 'UpdateOnSelectionItems()') {
      UpdateOnSelectionItems();
    } else {
      CreateToDoItems();
    }
  }
}

function CreateToDoItems() {
  if (todoValue.value === "") {
    todoAlert.innerText = "Please enter your todo text!";
    todoValue.focus();
  } else {
    let IsPresent = false;
    todo.forEach((element) => {
      if (element.item == todoValue.value) {
        IsPresent = true;
      }
    });

    if (IsPresent) {
      setAlertMessage("This item already present in the list!");
      return;
    }

    let li = document.createElement("li");
    const taskId = Date.now();
    const todoItems = `<div class="todo-content">
                    <div class="todo-text" title="Hit Double Click and Complete" ondblclick="CompletedToDoItems(this)">${todoValue.value}</div>
                    <div>
                      <button class="edit todo-controls" onclick="UpdateToDoItems(this)">✏️</button>
                      <button class="delete todo-controls" onclick="DeleteToDoItems(this)">🗑️</button>
                    </div>
                  </div>
                  <div class="timer-section">
                    <div class="timer-display">00:00:00</div>
                    <div class="timer-controls">
                      <button class="timer-btn timer-play" onclick="startTimer(${taskId})" title="Start Timer">▶️</button>
                      <button class="timer-btn timer-pause" onclick="pauseTimer(${taskId})" title="Pause Timer">⏸️</button>
                      <button class="timer-btn timer-reset" onclick="resetTimer(${taskId})" title="Reset Timer">🔄</button>
                    </div>
                  </div>`;
    li.setAttribute('data-task-id', taskId);
    li.innerHTML = todoItems;
    listItems.insertBefore(li, listItems.firstChild);

    if (!todo) {
      todo = [];
    }
    let itemList = { id: taskId, item: todoValue.value, status: false, timeSpent: 0, timerRunning: false };
    todo.unshift(itemList);
    setLocalStorage();
  }
  todoValue.value = "";
  setAlertMessage("Todo item Created Successfully!");
}

function ReadToDoItems() {
  todo.forEach((element) => {
    // Ensure old tasks get an ID if they don't have one
    if (!element.id) {
      element.id = Date.now() + Math.random();
    }
    
    let li = document.createElement("li");
    let style = "";
    if (element.status) {
      style = "style='text-decoration: line-through'";
    }
    const todoItems = `<div class="todo-content">
                    <div class="todo-text" ${style} title="Hit Double Click and Complete" ondblclick="CompletedToDoItems(this)">${element.item}
    ${
      style === ""
        ? ""
        : '<span class="todo-controls">✅</span>'
    }</div>
                    <div>
    ${
      style === ""
        ? '<button class="edit todo-controls" onclick="UpdateToDoItems(this)">✏️</button>'
        : ""
    }
    <button class="delete todo-controls" onclick="DeleteToDoItems(this)">🗑️</button>
                    </div>
                  </div>
                  <div class="timer-section">
                    <div class="timer-display">${formatTime(element.timeSpent || 0)}</div>
                    <div class="timer-controls">
                      <button class="timer-btn timer-play ${element.timerRunning ? 'active' : ''}" onclick="startTimer(${element.id})" title="Start Timer">▶️</button>
                      <button class="timer-btn timer-pause ${!element.timerRunning ? 'active' : ''}" onclick="pauseTimer(${element.id})" title="Pause Timer">⏸️</button>
                      <button class="timer-btn timer-reset" onclick="resetTimer(${element.id})" title="Reset Timer">🔄</button>
                    </div>
                  </div>`;
    li.setAttribute('data-task-id', element.id);
    li.innerHTML = todoItems;
    listItems.appendChild(li);
    
    // Restart timer if it was running
    if (element.timerRunning) {
      startTimer(element.id);
    }
  });
}
ReadToDoItems();

function UpdateToDoItems(e) {
  const taskElement = e.closest('li');
  const taskId = parseInt(taskElement.getAttribute('data-task-id'));
  
  if (
    taskElement.querySelector(".todo-text").style.textDecoration === ""
  ) {
    todoValue.value = taskElement.querySelector(".todo-text").innerText;
    updateText = taskElement.querySelector(".todo-text");
    updateTaskId = taskId;
    addUpdate.setAttribute("onclick", "UpdateOnSelectionItems()");
    addUpdate.innerText = "🔄";
    todoValue.focus();
  }
}

function UpdateOnSelectionItems() {
  let IsPresent = false;
  todo.forEach((element) => {
    if (element.item == todoValue.value) {
      IsPresent = true;
    }
  });

  if (IsPresent) {
    setAlertMessage("This item already present in the list!");
    return;
  }

  todo.forEach((element) => {
    if (element.item == updateText.innerText.trim()) {
      element.item = todoValue.value;
    }
  });
  setLocalStorage();

  updateText.innerText = todoValue.value;
  addUpdate.setAttribute("onclick", "CreateToDoItems()");
  addUpdate.innerText = "➕";
  todoValue.value = "";
  setAlertMessage("Todo item Updated Successfully!");
}

function DeleteToDoItems(e) {
  const taskElement = e.closest('li');
  const taskId = parseInt(taskElement.getAttribute('data-task-id'));
  const deleteValue = taskElement.querySelector(".todo-text").innerText;

  if (confirm(`Are you sure. Due you want to delete this ${deleteValue}!`)) {
    // Pause and cleanup timer
    pauseTimer(taskId);
    
    taskElement.setAttribute("class", "deleted-item");
    todoValue.focus();

    const itemIndex = todo.findIndex(element => element.id === taskId);
    if (itemIndex !== -1) {
      // Subtract time from total
      const timeToSubtract = todo[itemIndex].timeSpent || 0;
      totalSeconds = Math.max(0, totalSeconds - timeToSubtract);
      updateTotalTimeDisplay();
      localStorage.setItem("total-time", totalSeconds);
      
      todo.splice(itemIndex, 1);
    }

    setTimeout(() => {
      taskElement.remove();
    }, 1000);

    setLocalStorage();
  }
}

function CompletedToDoItems(e) {
  const taskElement = e.closest('li');
  const taskId = parseInt(taskElement.getAttribute('data-task-id'));
  
  if (e.style.textDecoration === "") {
    // Pause timer when completing task
    pauseTimer(taskId);
    
    const span = document.createElement("span");
    span.innerText = " ✅";
    span.className = "todo-controls";
    e.style.textDecoration = "line-through";
    e.appendChild(span);
    taskElement.querySelector("button.edit")?.remove();

    todo.forEach((element) => {
      if (element.id === taskId) {
        element.status = true;
        element.timerRunning = false;
      }
    });
    setLocalStorage();
    setAlertMessage("Todo item Completed Successfully!");
  }
}

function setLocalStorage() {
  localStorage.setItem("todo-list", JSON.stringify(todo));
}

function setAlertMessage(message) {
  todoAlert.removeAttribute("class");
  todoAlert.innerText = message;
  setTimeout(() => {
    todoAlert.classList.add("toggleMe");
  }, 1000);
}
