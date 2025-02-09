// Definizione delle variabili DOM
const todoInput = document.getElementById("todoInput");
const insertButton = document.getElementById("insertButton");
const todoList = document.getElementById("todolist");

let todos = []; // Lista dei task

// Funzione per aggiornare la visualizzazione della lista
const render = () => {
    let html = "";
    todos.forEach((todo) => {
        html += `
            <li id="todo_${todo.id}" class="${todo.completed ? "completed" : ""}" style="color: ${todo.completed ? 'green' : 'black'};">
                ${todo.name}
                ${!todo.completed ? `<button class="completato" data-id="${todo.id}">Completa</button>` : ""}
                <button class="cancella" data-id="${todo.id}">Elimina</button>
            </li>
        `;
    });
    todoList.innerHTML = html;

    document.querySelectorAll(".completato").forEach(button => {
        button.onclick = () => {
            const id = button.dataset.id;
            completeTodo({ id }).then(() => load().then((json) => {
                todos = json.todos;
                render();
            }));
        };
    });


    document.querySelectorAll(".cancella").forEach(button => {
        button.onclick = () => {
            const id = button.dataset.id;
            deleteTodo(id).then(() => load().then((json) => {
                todos = json.todos;
                render();
            }));
        };
    });
};

// Funzione per inviare una nuova To-Do al server
const send = (todo) => {
    return new Promise((resolve, reject) => {
       fetch("/todo/add", {
          method: 'POST',
          headers: {
             "Content-Type": "application/json"
          },
          body: JSON.stringify(todo)
       })
       .then((response) => response.json())
       .then((json) => {
          resolve(json); // risposta del server all'aggiunta
       })
    })
 };

// Funzione per caricare i To-Do dal server
const load = () => {
    return new Promise((resolve, reject) => {
       fetch("/todo")
       .then((response) => response.json())
       .then(data => resolve(data));
    })
 };

// Aggiunge un nuovo To-Do alla lista
insertButton.onclick = () => {
    const todoText = todoInput.value.trim();
    if (!todoText) {
        alert("Inserisci un nome valido per il TODO!");
        return;
    }
    const todo = { name: todoText, completed: false };
    send(todo)
        .then(() => load())
        .then((json) => { 
            todos = json.todos;
            todoInput.value = "";
            render();
        });
};

// API per completare un To-Do nel server
const completeTodo = (todo) => {
    return new Promise((resolve, reject) => {
       fetch("/todo/complete", {
          method: 'PUT',
          headers: {
             "Content-Type": "application/json"
          },
          body: JSON.stringify(todo)
       })
       .then((response) => response.json())
       .then((json) => {
          resolve(json);
       })
    })
 };

// API per eliminare un To-Do nel server
const deleteTodo = (id) => {
    return new Promise((resolve, reject) => {
       fetch("/todo/"+ id , {
          method: 'DELETE',
          headers: {
             "Content-Type": "application/json"
          },
       })
       .then((response) => response.json())
       .then((json) => resolve(json))
    })
 };

// Aggiornamento periodico della lista
setInterval(() => {
    load().then((json) => {
        todos = json.todos;
        render();
    });
}, 60000);

// Carica la lista dei task dal server all'avvio
load().then((json) => {
    todos = json.todos;
    render();
});