import { fetchTodos, createTodo, deleteTodo as apiDeleteTodo, toggleTodo as apiToggleTodo } from './api.js';

// State
let todos = [];

// DOM reference functions
function getTodoInput() {
  return document.getElementById('todo-input');
}

function getTodoList() {
  return document.getElementById('todo-list');
}

function getTodoForm() {
  return document.getElementById('todo-form');
}

// DOM creation
function createTodoElement(todo) {
  const li = document.createElement('li');
  li.classList.add('todo-item');
  if (todo.done) li.classList.add('completed');
  li.dataset.id = todo.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked = todo.done;
  checkbox.setAttribute('aria-label', `완료: ${todo.content}`);

  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = todo.content;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '🗑';
  deleteBtn.setAttribute('aria-label', '삭제');

  const actions = document.createElement('div');
  actions.className = 'item-actions';
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(actions);
  return li;
}

// Render functions
function renderTodo(todo) {
  const li = createTodoElement(todo);
  getTodoList().appendChild(li);
}

function removeTodoElement(id) {
  const item = getTodoList().querySelector(`[data-id="${id}"]`);
  if (item) item.remove();
}

function updateTodoElement(id, completed) {
  const item = getTodoList().querySelector(`[data-id="${id}"]`);
  if (!item) return;
  item.classList.toggle('completed', completed);
  const checkbox = item.querySelector('.todo-checkbox');
  if (checkbox) checkbox.checked = completed;
}

// Business logic
async function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const todo = await createTodo(trimmed);
  todos.push(todo);
  renderTodo(todo);
}

async function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  const updated = await apiToggleTodo(id, !todo.done);
  todo.done = updated.done;
  updateTodoElement(id, todo.done);
}

async function deleteTodo(id) {
  await apiDeleteTodo(id);
  todos = todos.filter(t => t.id !== id);
  removeTodoElement(id);
}

// Input handling
function getInputValue() {
  const input = getTodoInput();
  const value = input.value.trim();
  input.value = '';
  return value;
}

// Event handlers
function handleFormSubmit(e) {
  e.preventDefault();
  const text = getInputValue();
  if (text) addTodo(text);
}

function handleListClick(e) {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.classList.contains('todo-checkbox')) {
    toggleTodo(id);
  } else if (e.target.classList.contains('delete-btn')) {
    deleteTodo(id);
  }
}

// Init
async function init() {
  const dateEl = document.getElementById('today-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });
  }
  getTodoForm().addEventListener('submit', handleFormSubmit);
  getTodoList().addEventListener('click', handleListClick);

  const initialTodos = await fetchTodos();
  todos = initialTodos;
  todos.forEach(renderTodo);
}

// Bootstrap
document.addEventListener('DOMContentLoaded', init);
