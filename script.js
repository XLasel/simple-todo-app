'use strict';
const taskInput = document.querySelector('.todo-app__new-task')
const sectionList = document.querySelector('.todo-app__list');
const tasksList = document.querySelector('.todo-app__items');
const footer = document.querySelector('.todo-app__footer');
const counter = document.getElementById('counter');
const toggleAll = document.getElementById('toggle-all');
const btnClear = document.querySelector(".todo-app__clear");
const filterLinks = document.querySelectorAll(".todo-app__filter-link")

let tasks = [];

if (localStorage.getItem('tasks')) {
	tasks = JSON.parse(localStorage.getItem('tasks'));
	tasks.forEach((task) => renderTask(task));
}

checkEmptyList();
checkStatusTasks();
activeCount();

taskInput.addEventListener('keydown', (event) => {
	if (event.keyCode === 13) {
		addTask();
	}
});
document.addEventListener('click', (event) => {
	if (event.target !== taskInput) {
		addTask();
	}
});
tasksList.addEventListener('click', (event) => {
	deleteTask(event);
	doneTask(event);
});
toggleAll.addEventListener('change', () => {
	const checked = toggleAll.checked;
	tasks.forEach(function (task) {
		task.done = checked;
		const taskElement = document.getElementById(task.id);
		taskElement.classList.toggle('completed', checked);
		taskElement.querySelector('.todo-app__task-toggle').checked = checked;

	});
	activeCount();
});
footer.addEventListener('click', clearCompleted);
filterLinks.forEach(link => link.addEventListener("click", showByFilter));
applyFilterFromUrl();
if (window.matchMedia("(pointer: coarse)").matches) {
	tasksList.addEventListener('touchstart', (event) => {
		const touchStartTime = new Date().getTime();
		setTimeout(() => {
			const touchEndTime = new Date().getTime();
			const touchDuration = touchEndTime - touchStartTime;

			if (touchDuration >= 1000) {
				editTask(event);
			}
		}, 1000);
	});
} else {
	tasksList.addEventListener('dblclick', editTask);
}
window.addEventListener('beforeunload', saveToLocalStorage);


function addTask() {
	const taskText = taskInput.value;
	if (taskText !== '') {
		const newTask = {
			id: Date.now(),
			text: taskText,
			done: false,
		};

		tasks.push(newTask);

		renderTask(newTask);

		taskInput.value = '';
		taskInput.focus();

		checkEmptyList();
		checkStatusTasks()
		activeCount()
	}
}

function deleteTask(event) {

	if (event.target.dataset.action !== 'delete') return;

	const parenNode = event.target.closest('.todo-app__task');

	const id = Number(parenNode.id);

	const index = tasks.findIndex((task) => task.id === id);

	tasks.splice(index, 1);

	parenNode.remove();

	checkEmptyList();
	checkStatusTasks()
	activeCount()
}

function doneTask(event) {

	if (event.target.dataset.action !== 'done') return;

	const parentNode = event.target.closest('.todo-app__task');

	const id = Number(parentNode.id);

	const task = tasks.find((task) => task.id === id);
	task.done = !task.done

	parentNode.classList.toggle('completed');

	checkStatusTasks()
	activeCount()
}

function editTask(event) {
	if (event.target.className !== 'todo-app__task-label') return;

	const taskItem = event.target;
	const parentNode = event.target.closest('.todo-app__task');
	parentNode.classList.add('todo-app__task_editing');
	const editTaskHTML = `<div class="edit-task_flex"><input class="edit-task" type="text"></div>`;
	parentNode.insertAdjacentHTML('beforeend', editTaskHTML);

	const editTask = parentNode.querySelector('.edit-task');
	editTask.value = taskItem.textContent;

	function saveEdit() {
		const id = Number(parentNode.id);
		const task = tasks.find((task) => task.id === id);
		task.text = editTask.value;
		taskItem.textContent = editTask.value;
		parentNode.classList.remove('todo-app__task_editing');
		editTask.closest('.edit-task_flex').remove();
		editTask.removeEventListener('keydown', saveEdit);
	}

	editTask.addEventListener('keydown', (event) => {
		if (event.keyCode === 13) {
			saveEdit();
		}
	});

	document.addEventListener('click', function handler(event) {
		if (event.target === editTask) return;
		event.stopPropagation();
		saveEdit(event);
		document.removeEventListener('click', handler);
	});
}

function checkEmptyList() {
	if (tasks.length === 0) {
		footer.style.display = 'none';
		sectionList.style.display = 'none';
	}
	if (tasks.length > 0) {
		footer.style.display = 'block';
		sectionList.style.display = 'block';
	}
}

function checkStatusTasks() {
	if (tasks.length === 0) {
		return toggleAll.checked = false;
	}
	tasks.every((task) => task.done ? toggleAll.checked = true : toggleAll.checked = false);
}

function activeCount() {
	return counter.textContent = tasks.reduce((total, task) => (task.done === true) ? total : total + 1, 0);
}

function clearCompleted(event) {
	if (event.target !== btnClear) return;
	const doneTasks = tasks.filter(task => task.done);
	doneTasks.forEach((task) => {
		const id = task.id;
		document.getElementById(id).remove();
		const indexTask = tasks.findIndex((task) => task.id === id);
		tasks.splice(indexTask, 1);
	});

	checkEmptyList();
	checkStatusTasks();
}

function showByFilter(event) {
	if (event.target.classList.contains('selected')) return;

	filterLinks.forEach((item) => {
		if (item === event.target) {
			item.classList.add('selected');
		} else if (item.classList.contains('selected')) {
			item.classList.remove('selected');
		}
	});

	if (event.target.id === "filter-all") {
		tasksList.className = 'todo-app__items';
	}

	if (event.target.id === "filter-active") {
		if (tasksList.classList.contains("todo-app__items_completed")) {
			tasksList.classList.remove('todo-app__items_completed')
		}
		tasksList.classList.add('todo-app__items_active')
	}


	if (event.target.id === "filter-completed") {
		if (tasksList.classList.contains("todo-app__items_active")) {
			tasksList.classList.remove('todo-app__items_active')
		}
		tasksList.classList.add('todo-app__items_completed')
	}
}

function applyFilterFromUrl() {
	const section = location.hash.replace('#/', '');
	const link = document.querySelector(`#filter-${section}`);

	if (link) {
		link.click();
	}
}

function saveToLocalStorage() {
	localStorage.setItem('tasks', JSON.stringify(tasks))
}

function renderTask(task) {

	const cssClass = task.done ? 'todo-app__task completed' : 'todo-app__task';
	const checked = task.done ? 'checked' : '';

	const taskHTML = `
  <li id="${task.id}" class="${cssClass}">
    <div class="view">
      <input type="checkbox" data-action="done" class="todo-app__task-toggle" ${checked}>
      <label class="todo-app__task-label">${task.text}</label>
      <button data-action="delete" class="todo-app__task-delete"></button>
    </div>
  </li>
		`;
	tasksList.insertAdjacentHTML('beforeend', taskHTML);
};