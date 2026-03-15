// State
let todos = []; // Array of { id, text, completed }
let nextId = 1;

// DOM reference functions (SRP: each gets ONE element)

/**
 * Returns the todo text input element.
 * @returns {HTMLInputElement}
 */
function getTodoInput() {
  return document.getElementById('todo-input');
}

/**
 * Returns the todo list ul element.
 * @returns {HTMLUListElement}
 */
function getTodoList() {
  return document.getElementById('todo-list');
}

/**
 * Returns the todo form element.
 * @returns {HTMLFormElement}
 */
function getTodoForm() {
  return document.getElementById('todo-form');
}

// Data functions (SRP: pure state operations)

/**
 * Creates a new todo object.
 * @param {string} text - The todo text
 * @returns {{ id: number, text: string, completed: boolean }}
 */
function createTodoData(text) {
  return { id: nextId++, text, completed: false };
}

// DOM creation (SRP: creates element, does not append)

/**
 * Creates a todo <li> DOM element from a todo object.
 * Uses createElement, classList, dataset, textContent, setAttribute.
 * @param {{ id: number, text: string, completed: boolean }} todo
 * @returns {HTMLLIElement}
 */
function createTodoElement(todo) {
  const li = document.createElement('li');
  li.classList.add('todo-item');
  if (todo.completed) li.classList.add('completed');
  li.dataset.id = todo.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked = todo.completed;
  checkbox.setAttribute('aria-label', `완료: ${todo.text}`);

  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = todo.text;

  const editBtn = document.createElement('button');
  editBtn.className = 'edit-btn';
  editBtn.textContent = '✎';
  editBtn.setAttribute('aria-label', '편집');

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '🗑';
  deleteBtn.setAttribute('aria-label', '삭제');

  const actions = document.createElement('div');
  actions.className = 'item-actions';
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(actions);
  return li;
}

// Render functions (SRP: DOM mutations only)

/**
 * Appends a new todo item to the list.
 * @param {{ id: number, text: string, completed: boolean }} todo
 */
function renderTodo(todo) {
  const li = createTodoElement(todo);
  getTodoList().appendChild(li);
}

/**
 * Removes the <li> element with the matching data-id from the list.
 * @param {number} id
 */
function removeTodoElement(id) {
  const item = getTodoList().querySelector(`[data-id="${id}"]`);
  if (item) item.remove();
}

/**
 * Updates the completed class and checkbox state for the given todo id.
 * @param {number} id
 * @param {boolean} completed
 */
function updateTodoElement(id, completed) {
  const item = getTodoList().querySelector(`[data-id="${id}"]`);
  if (!item) return;
  item.classList.toggle('completed', completed);
  const checkbox = item.querySelector('.todo-checkbox');
  if (checkbox) checkbox.checked = completed;
}

// Business logic (SRP: state + DOM coordination)

/**
 * Validates text, creates a todo data object, pushes it to state, and renders it.
 * @param {string} text
 */
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const todo = createTodoData(trimmed);
  todos.push(todo);
  renderTodo(todo);
}

/**
 * Finds the todo by id, flips its completed flag, and updates the DOM.
 * @param {number} id
 */
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  updateTodoElement(id, todo.completed);
}

/**
 * Removes the todo with the given id from state and from the DOM.
 * @param {number} id
 */
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  removeTodoElement(id);
}

// Input handling (SRP)

/**
 * Reads the current input value, trims it, clears the input field, and returns the value.
 * @returns {string}
 */
function getInputValue() {
  const input = getTodoInput();
  const value = input.value.trim();
  input.value = '';
  return value;
}

// Event handlers (SRP: only handle event, delegate to business logic)

/**
 * Handles form submit: prevents default, reads input, adds todo if non-empty.
 * @param {Event} e
 */
function handleFormSubmit(e) {
  e.preventDefault();
  const text = getInputValue();
  if (text) addTodo(text);
}

/**
 * Puts a todo item into inline edit mode.
 * Replaces the .todo-text span with an <input>, focused and pre-filled.
 * Saves on Enter/blur, cancels on Escape. Uses a committed flag to prevent double-fire.
 * @param {number} id
 */
function editTodo(id) {
  const item = getTodoList().querySelector(`[data-id="${id}"]`);
  if (!item) return;
  const span = item.querySelector('.todo-text');
  if (!span || item.querySelector('.todo-edit-input')) return; // guard: already editing

  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  const originalText = todo.text;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'todo-edit-input';
  input.value = originalText;

  let committed = false;

  function commit() {
    if (committed) return;
    committed = true;
    const newText = input.value.trim();
    if (newText) todo.text = newText;
    const newSpan = document.createElement('span');
    newSpan.className = 'todo-text';
    newSpan.textContent = todo.text;
    input.replaceWith(newSpan);
  }

  function cancel() {
    if (committed) return;
    committed = true;
    const newSpan = document.createElement('span');
    newSpan.className = 'todo-text';
    newSpan.textContent = originalText;
    input.replaceWith(newSpan);
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  });

  span.replaceWith(input);
  input.focus();
  input.select();
}

// CHOSEN APPROACH: Event delegation on #todo-list
// WHY: Single listener handles all current AND future todo items.
// Alternative: Individual listeners per item — less efficient, requires
// re-registration on each render. Event delegation is O(1) regardless of list size.

/**
 * Handles click events on the todo list via event delegation.
 * Delegates to toggleTodo or deleteTodo based on the clicked element.
 * @param {MouseEvent} e
 */
function handleListClick(e) {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const id = Number(item.dataset.id);

  if (e.target.classList.contains('todo-checkbox')) {
    toggleTodo(id);
  } else if (e.target.classList.contains('delete-btn')) {
    deleteTodo(id);
  } else if (e.target.classList.contains('edit-btn')) {
    editTodo(id);
  }
}

// Init (SRP: only registers events)

/**
 * Registers all event listeners. Called once on DOMContentLoaded.
 */
function init() {
  const dateEl = document.getElementById('today-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });
  }
  getTodoForm().addEventListener('submit', handleFormSubmit);
  getTodoList().addEventListener('click', handleListClick);
}

// Bootstrap
document.addEventListener('DOMContentLoaded', init);
