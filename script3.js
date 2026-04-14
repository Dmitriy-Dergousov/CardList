const STORAGE_KEY = 'tasklist_tasks';

const STATUSES = {
    todo: { label: 'К выполнению', badge: 'bg-secondary' },
    progress: { label: 'В процессе', badge: 'bg-warning text-dark' },
    done: { label: 'Готово', badge: 'bg-success' },
};

const STATUS_ORDER = ['todo', 'progress', 'done'];

function newId() {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}


function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return [
                { id: newId(), title: 'Learn JS', status: 'todo' },
                { id: newId(), title: 'Do Homework', status: 'done' }
            ]
        }

        const data = JSON.parse(raw);
        if (!Array.isArray(data)) return [];
        return data;

    } catch {
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
    catch (e) {
        console.error('Не удалось сохранить в localStorage', e);
    }

    //JSON.stringify(..) преобразует Js-объект в строку
    //localStorage умеет хранить только строки

    //Например, был объект
    // const tasks = [
    //    { title: "Learn JS", done: false}
    // ]

    // После JSON.stringify().
    // [{"title":"Learn Js", "done":false}]   ЭТО УЖЕ СТРОКА
}

function tasksInStatus(status) {
    return tasks.filter((t) => t.status === status);
}


function renderTasks() {
    boardEl.innerHTML = '';

    STATUS_ORDER.forEach((status) => {
        const meta = STATUSES[status];

        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';

        const list = tasksInStatus(status);
        col.innerHTML = `
            <div class="card border-0 shadow-sm board-column h-100">
                <div class="card-header fw-semibold d-flex justify-content-between align-items-center">
                    <span>${meta.label}</span>
                    <span class="badge ${meta.badge}">${list.length}</span>
                </div>

                <div class="card-body pt-2 drop-zone" data-status="${status}"></div>
            </div>  
        `;

        boardEl.appendChild(col);
        const zone = col.querySelector('.drop-zone');

        if (list.length == 0) {
            const empty = document.createElement('div');
            empty.className = 'text-muted small text-center py-4';
            empty.textContent = 'Перетащите сюда задачу';
            zone.appendChild(empty);
        }

        list.forEach((task) => {
            zone.appendChild(createTaskCard(task));
        })

        bindDropZone(zone, status);
    });

    addCardEvents();
}

// function addEvents() {
//     const checkboxes = document.querySelectorAll('.form-check-input');

//     checkboxes.forEach(cb => {
//         cb.addEventListener('change', () => {
//             const index = cb.dataset.index;
//             tasks[index].done = cb.checked;
//             renderTasks();
//         });
//     });


//     const deleteBtns = document.querySelectorAll('.delete-btn');
//     deleteBtns.forEach(btn => {
//         btn.addEventListener('click', () => {
//             const index = Number(btn.dataset.index);
//             tasks.splice(index, 1); //удали начиная с позиции index в кол-ве "1" элемент
//             renderTasks();
//         });
//     });


//     //Редактирование по клику на заголовок
//     const editableEls = document.querySelectorAll('.editable');
//     editableEls.forEach(el => {
//         el.addEventListener('click', () => {
//             const index = Number(el.dataset.index);
//             const task = tasks[index];

//             //контейнер
//             const wrapper = document.createElement('div');
//             wrapper.className = 'd-flex gap-2';

//             //input
//             const input = document.createElement('input');
//             input.type = 'text';
//             input.value = task.title;
//             input.className = 'form-control';

//             //Кнопка Save
//             const saveBtn = document.createElement('button');
//             saveBtn.className = 'btn btn-success btn-sm';
//             saveBtn.textContent = 'Save';

//             //Кнопка Cancel
//             const cancelBtn = document.createElement('button');
//             cancelBtn.className = 'btn btn-secondary btn-sm';
//             cancelBtn.textContent = 'Cancel';

//             //собираем
//             wrapper.appendChild(input);
//             wrapper.appendChild(saveBtn);
//             wrapper.appendChild(cancelBtn);

//             el.replaceWith(wrapper);
//             input.focus();

//             function save() {
//                 task.title = input.value.trim() || task.title;
//                 renderTasks();
//             }

//             function cancel() {
//                 renderTasks();
//             }

//             saveBtn.addEventListener('click', save);
//             cancelBtn.addEventListener('click', cancel);

//             //СОхраняем по нажатию на enter
//             input.addEventListener('keydown', (event) => {
//                 if (event.key === 'Enter') {
//                     save();
//                 }
//             });


//             function handleClickOutside(e) {
//                 if (!wrapper.contains(e.target)) {
//                     cancel();
//                     document.removeEventListener('mousedown', handleClickOutside);
//                 }
//             }

//             document.addEventListener('mousedown', handleClickOutside);
//         })
//     })
// }

function createTaskCard(task) {
    const meta = STATUSES[task.status];
    const wrap = document.createElement('div');
    wrap.className = 'card mb-2 task-card border';
    wrap.draggable = true;
    wrap.dataset.taskId = task.id;
    wrap.innerHTML = `
        <div class="card-body py-2 px-3">
            <div class="d-flex justify-content-between align-items-start gap-2">
                <h6 class="card-title editable mb-1 flex-grow-1" data-task-id="${task.id}">${task.title}</h6>
                <button type="button" class="btn btn-outline-danger btn-sm delete-btn" data-task-id="${task.id}" title="Удалить">×</button>
            </div>
            <span class="badge ${meta.badge}">${meta.label}</span>
        </div>
    `;
    return wrap;
}

function bindDropZone(zone, status){
    zone.addEventListener('dragover', (e)=>{
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');

    });

    //уход из зон
    zone.addEventListener('dragleave', (e)=>{
        if (!zone.contains(e.relatedTarged)) zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e)=>{
        
    });
}

function addCardEvents(){
    document.querySelectorAll('.task-card').forEach((card)=>{
        const id = card.dataset.taskId;

        card.addEventListener('dragstart',(e)=>{
            draggedTaskId = id; // запоминаем что тянем
            e.dataTransfer.setData("text/plain", id)
        })
    });
}



let tasks = loadTasks();

const titleInp = document.getElementById('titleInput');
const addBtn = document.getElementById('addTask');
const boardEl = document.getElementById('board');

let draggedTaskId = null;

renderTasks();




addBtn.addEventListener('click', () => {
    const title = titleInp.value.trim();

    if (!title) {
        alert("Enter task text!");
        return;
    }

    if (!isNaN(title)) {
        alert(`Use text`);
        return;
    }

    const task = { title: title, done: false };
    tasks.push(task);

    renderTasks();

    titleInp.value = "";
});

titleInp.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addBtn.click();
    }
})




















// ------
// let dateTimeNow = Date.now();
// let mathRandom = Math.random();
// let mathRSlice = mathRandom.toString(36).slice(2);

// let testId = 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2)
// console.log(testId);



// let age = 8;

// let result;

// if (age >= 18){
//     result = "Взрослый";
// } else{
//     result = "Ребёнок";
// }

// console.log(result);



// function getDiscount(price){
//     // if (price > 1000){
//     //     return price * 0.9;
//     // } else{
//     //     return price;
//     // }

// }

// function getDiscount(price) {
//     return price > 1000 ? price * 0.9 : price;
// }

// let result1 = getDiscount(1500);
// let result2 = getDiscount(500);

// console.log(result1);
// console.log(result2);

// let age = 18;

// let result = age >=18 ? "Взрослый" : "Ребёнок";

// console.log(result);


let arr = [1, 2, 3];
let str = "hello";
let obj = { a: 1 };

console.log(Array.isArray(arr));
console.log(Array.isArray(str));
console.log(Array.isArray(obj));

