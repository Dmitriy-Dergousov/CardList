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
                { id: newId(), title: 'Learn JS', status: 'todo', dueDate: null, pinned: true },
                { id: newId(), title: 'Do Homework', status: 'done', dueDate: null, pinned: false },
                { id: newId(), title: 'Task3', status: 'done', dueDate: null, pinned: false },
                { id: newId(), title: 'Task4', status: 'progress', dueDate: null, pinned: false },
                { id: newId(), title: 'Task5', status: 'progress', dueDate: null, pinned: false },
                { id: newId(), title: 'Task6', status: 'todo', dueDate: null, pinned: false },
                { id: newId(), title: 'Task7', status: 'done', dueDate: null, pinned: false },
                { id: newId(), title: 'Task8', status: 'todo', dueDate: null, pinned: false },
                { id: newId(), title: 'Task9', status: 'done', dueDate: null, pinned: false }
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

function normalizeOrderForPins(){
    const orderMap = new Map(); //id задачи - ее индекс
    tasks.forEach((t,i) => orderMap.set(t.id, i)); //сохраняем исходній порядок

    //Новій масив сюда будем собирать отсортированніе задачи
    const next = [];

    //Проходи по статусам (todo, in-progress ,done)
    for(const s of STATUS_ORDER){
        //берем задачи єтого статуса
        const group = tasks.filter((t) => t.status === s);

        //делим на закреп ине закреп
        const pin = group.filter((t) => t.pinned);
        const unpin = group.filter((t) => !t.pinned);

        pin.sort((a,b) => orderMap.get(a.id) - orderMap.get(b.id));
        unpin.sort((a,b) => orderMap.get(a.id) - orderMap.get(b.id));
        next.push(...pin, ...unpin);
    }
}

function renderTasks() {
    normalizeOrderForPins();
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
    saveTasks();
}

function todayStrLocal(){
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate() + 1).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function isOverdue(dueDate, status){
    if (!dueDate || status === 'done') return false;
    return dueDate < todayStrLocal();
}

function formatDueDateLabel(yyyyMmDd){
    const d = new Date(yyyyMmDd + "T12:00:00")
    if(isNaN(d.getTime())) return yyyyMmDd;
    return d.toLocaleDateString('ru-Ru', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

function createTaskCard(task) {
    const meta = STATUSES[task.status];
    const wrap = document.createElement('div');
    wrap.className = 'card mb-2 task-card border';
    wrap.draggable = true;
    wrap.dataset.taskId = task.id;

    const dueLine = task.dueDate
        ? (() =>{
            const past = isOverdue(task.dueDate, task.status);
            const cls = past 
                ? 'text-danger' 
                : 'text-muted';

            const overdueLabel = past
                ? '<span class="text-uppercase" style="font-size:0.7rem">(просрочено)</span>' 
                : '';
            const dueDateLabel = formatDueDateLabel(task.dueDate);
            return `
                <div class="task-due ${cls}">
                    <span>📅</span>
                    ${dueDateLabel}
                    ${overdueLabel}
                </div>
            `
        })()
        : '';

    wrap.innerHTML = `
        <div class="card-body py-2 px-3">
            <div class="d-flex justify-content-between align-items-start gap-2">
                <h6 class="card-title editable mb-1 flex-grow-1" data-task-id="${task.id}">${task.title}</h6>
                <button type="button" class="btn btn-outline-danger btn-sm delete-btn" data-task-id="${task.id}" title="Удалить">×</button>
            </div>
            ${dueLine}
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
        if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e)=>{
        e.preventDefault();
        console.log('drop');
        zone.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        if(!id) return;

        moveTaskToColumn(id, status);
        renderTasks();
    })
}

function addCardEvents(){
    document.querySelectorAll('.task-card').forEach((card)=>{
        const id = card.dataset.taskId;

        card.addEventListener('dragstart',(e)=>{
            draggedTaskId = id; // запоминаем что тянем
            e.dataTransfer.setData("text/plain", id);
            e.dataTransfer.effectAllowed = 'move';
            card.classList.add('dragging');
        })

        card.addEventListener('dragend', ()=>{
            draggedTaskId = null;
            card.classList.remove('dragging');
            document.querySelectorAll('.drop-zone').forEach((z) => z.classList.remove('drag-over'));
        });
    })

    document.querySelectorAll('.delete-btn').forEach((btn) =>{
        btn.addEventListener('click', (e)=>{
            e.stopPropagation();
            const taskId = btn.dataset.taskId;
            tasks = tasks.filter((t) => t.id !== taskId);
            renderTasks();
        })
    });
}

function moveTaskToColumn(taskId, newStatus){
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;

    const[task] = tasks.splice(idx, 1);
    task.status = newStatus;

    const orderRank = (s) => STATUS_ORDER.indexOf(s);
    const r = orderRank(newStatus);
    let insertedAt = tasks.length;
    for (let i = tasks.length - 1; i >= 0; i--){
        if (tasks[i].status === newStatus){
            insertedAt = i+1;
            break;
        }
    }
    tasks.splice(insertedAt,0,task);
}


let tasks = loadTasks();

const titleInp = document.getElementById('titleInput');
const addBtn = document.getElementById('addTask');
const boardEl = document.getElementById('board');
const dueDateInp = document.getElementById('dueDateInput');

let draggedTaskId = null;

renderTasks();




addBtn.addEventListener('click', () => {
    const title = titleInp.value.trim();

    if (!title) {
        alert("Используйте текст!");
        return;
    }

    if (!isNaN(title)) {
        alert(`Используйте текст`);
        return;
    }

    const due = dueDateInp.value;
    

    tasks.push({ id: newId(), title, status: 'todo',  dueDate: due });

    renderTasks();

    titleInp.value = "";
    dueDateInp.value = "";
});

titleInp.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addBtn.click();
    }
})

document.getElementById('clearBoard').addEventListener('click', ()=>{
    if(tasks.length === 0) return;
    if(!confirm('Удалить все задачи с доски?')) return;
    tasks = [];
    renderTasks();
});




















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


// let arr = [1, 2, 3];
// let str = "hello";
// let obj = { a: 1 };

// console.log(Array.isArray(arr));
// console.log(Array.isArray(str));
// console.log(Array.isArray(obj));

