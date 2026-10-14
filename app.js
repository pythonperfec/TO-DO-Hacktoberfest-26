const STORAGE_KEY = "daily-list-tasks";

const elements = {
  form: document.querySelector("#addForm"),
  input: document.querySelector("#taskInput"),
  list: document.querySelector("#taskList"),
  empty: document.querySelector("#emptyState"),
  emptyTitle: document.querySelector("#emptyTitle"),
  emptyCopy: document.querySelector("#emptyCopy"),
  total: document.querySelector("#totalCount"),
  completed: document.querySelector("#completedCount"),
  progressBar: document.querySelector("#progressBar"),
  progressCopy: document.querySelector("#progressCopy"),
  date: document.querySelector("#dateStamp"),
  clearCompleted: document.querySelector("#clearCompleted"),
  clearAll: document.querySelector("#clearAll"),
  filters: document.querySelectorAll(".filter-button")
};

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  const visibleTasks = tasks.filter((task) => currentFilter === "all" || (currentFilter === "active" && !task.completed) || (currentFilter === "completed" && task.completed));
  elements.list.replaceChildren(...visibleTasks.map(createTaskElement));
  elements.empty.hidden = visibleTasks.length > 0;

  if (visibleTasks.length === 0 && tasks.length > 0) {
    elements.emptyTitle.textContent = currentFilter === "completed" ? "No completed tasks." : "All caught up.";
    elements.emptyCopy.textContent = currentFilter === "completed" ? "Finished tasks will appear here." : "Take a breath, then add something new.";
  } else {
    elements.emptyTitle.textContent = "Nothing here yet.";
    elements.emptyCopy.textContent = "Add your first task above and make the day yours.";
  }

  updateSummary();
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " completed" : ""}`;
  item.dataset.id = task.id;

  const checkButton = document.createElement("button");
  checkButton.className = "check-button";
  checkButton.type = "button";
  checkButton.setAttribute("aria-label", task.completed ? `Mark ${task.text} active` : `Complete ${task.text}`);
  checkButton.textContent = "✓";
  checkButton.addEventListener("click", () => toggleTask(task.id));

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
  deleteButton.textContent = "×";
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  item.append(checkButton, text, deleteButton);
  return item;
}

function updateSummary() {
  const completedCount = tasks.filter((task) => task.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  elements.completed.textContent = completedCount;
  elements.total.textContent = totalCount;
  elements.progressBar.style.width = `${progress}%`;
  elements.progressCopy.textContent = totalCount === 0 ? "A clear start." : progress === 100 ? "Everything is done." : `${progress}% complete`;
}

function addTask(text) {
  tasks.unshift({ id: crypto.randomUUID(), text: text.trim(), completed: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.input.value.trim();
  if (!text) return;
  addTask(text);
  elements.form.reset();
  elements.input.focus();
});

elements.filters.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    elements.filters.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    render();
  });
});

elements.clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

elements.clearAll.addEventListener("click", () => {
  if (tasks.length === 0 || window.confirm("Delete all tasks?")) {
    tasks = [];
    saveTasks();
    render();
  }
});

elements.date.textContent = new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(new Date());
render();