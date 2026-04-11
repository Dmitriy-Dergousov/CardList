// const tasks = [
//  {title: "Learn JS", done: false},
//  {title: "Do homework", done: true}
// ];

const STORAGE_KEY = 'tasklist_tasks';

const STATUSES = {
    todo: {label: 'К выполнению', bage: 'bg-secondary'},
    progress: {label: 'В процессе', bage: 'bg-warning text-dark'},
    done: {label: 'Готово', bage: 'bg-success'},
};

const STATUS_ORDER = ['todo', 'progress', 'done'];

function newId(){
    return crypto.randomUUID
        ? crypto.randomUUID()
        : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        
        return [
              { id: newId(), title: "Learn JS", done: false },
             { id: newId(), title: "Do homework", done: true }
        ];
      
        
    } catch {
        return [];
    }
}

function saveTasks(){
    try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
    catch(e){
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

function tasksInStatus(status){
    return tasks.filter((t) => t.status === status);
}

let tasks = loadTasks();

const titleInp = document.getElementById('titleInput');
const addBtn = document.getElementById('addTask');
const boardEl = document.getElementById('board');


// function renderTasks(){
//     boardEl.innerHTML = "";

//     if(tasks.length === 0){
//         const noTasks = document.createElement('div');
//         noTasks.className = "col-12 text-center text-muted my-5";
//         noTasks.innerHTML = "<h4>No tasks</h4>"
//         boardEl.appendChild(noTasks);
//         return;
//     }

//     tasks.forEach((task, index) => {
//         const col = document.createElement('div');
//         col.className = "col-md-4 mb-3";

//         // const status = task.done ? "Completed" : "In progress";
//         // const badge = task.done ? "bg-success" : "bg-warning";

//         let status;
//         let badge;

        
//             if (task.done) {
//                 status = "Completed";
//                 badge = "bg-success";
//             } else {
//                 status = "In progress";
//                 badge = "bg-warning";
//             }
            
//         col.innerHTML = `
//             <div class="card shadow-sm">
//                 <div class="card-body">
                   
//                     <div class="form-check mb-2">
//                         <input 
//                             class="form-check-input"
//                             type="checkbox"
//                             ${task.done ? "checked" : ""}
//                             data-index=${index}
//                         >
//                         <label class="form-check-label">
//                         Mark as done
//                         </label>
//                     </div>

//                     <h5 class="card-title editable" data-index=${index}>${task.title}</h5>
//                     <span class="badge ${badge}">${status}</span>

//                     <div class="mt-3"> 
//                         <button class="btn btn-danger btn-sm delete-btn" data-index="${index}">
//                             Delete
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         `;

//         boardEl.appendChild(col);
//     })

//     addEvents();
//     saveTasks();
// }

function renderTasks(){
    boardEl.innerHTML = '';

    STATUS_ORDER.forEach((status)=>{
        const meta = STATUSES[status];

        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';

        const list = tasksInStatus(status);
        col.innerHTML = `
            <div class="card border-0 shadow-sm board-column h-100 ">
                <div class="card-header">
                
                </div>
            </div>
        `;
    })
}

function addEvents(){
    const checkboxes = document.querySelectorAll('.form-check-input');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const index = cb.dataset.index;
            tasks[index].done = cb.checked;
            renderTasks();
        })
    });

    //Delete task
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', ()=>{
            const index = Number(btn.dataset.index);
            tasks.splice(index, 1); //Удали начиная с позиции  index в количестве '1' єлетент
            renderTasks();
        });
    });

    //Редактирование по клику на заголовок
    const editableEls = document.querySelectorAll('.editable');
    editableEls.forEach(el => {
        el.addEventListener('click', ()=>{
            const index = Number(el.dataset.index);
            const task = tasks[index];

            //container
            const wrapper = document.createElement('div');
            wrapper.className = 'd-flex gap-2';

            //input
            const input = document.createElement('input');
            input.type = 'text';
            input.value = task.title;
            input.className = 'form-control';

            //button save
            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn btn-success btn-sm';
            saveBtn.textContent = 'Save';

            //btn cancel
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary btn-sm';
            cancelBtn.textContent = 'Cancel'

            //сoбираем в кучу добавляя в div
            wrapper.appendChild(input);
            wrapper.appendChild(saveBtn);
            wrapper.appendChild(cancelBtn);


            el.replaceWith(wrapper);
            input.focus();

            function save(){
                task.title = input.value.trim() || task.title;
                renderTasks();
            }

            function cancel(){
                renderTasks();
            }

            saveBtn.addEventListener('click', save);
            cancelBtn.addEventListener('click', cancel);

            //Save when press Enter
            input.addEventListener('keydown', (event)=>{
                if(event.key === 'Enter'){
                    save();
                }
            });

            function handleClickOutside(e){
                if(!wrapper.contains(e.target)){
                    cancel();
                    document.removeEventListener('mousedown', handleClickOutside);
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
        })
    })
}

addBtn.addEventListener('click', () => {
    const title = titleInp.value.trim();
   
    if(!title){
        alert("Enter task text!");
        return;
    }


    if(Number(title)){
        alert(`Use text`);
        return;
    }

    const task = {title: title, done: false};
    tasks.push(task);

    renderTasks();

    titleInp.value = "";

    })

    titleInp.addEventListener('keydown', (event)=>{
        if(event.key === 'Enter'){
            addBtn.click();
        }
    })
    
    renderTasks();
    