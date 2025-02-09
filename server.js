const http = require("http");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const PORT = 80;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const path = require('path');
app.use("/", express.static(path.join(__dirname, "public")));

const todos = []; // Lista dei task

// Endpoint per aggiungere un nuovo To-Do
app.post("/todo/add", (req, res) => {
    const todo = req.body;
    todo.id = "" + new Date().getTime();
    todos.push(todo);
    res.json({result: "Ok"});
});

// Endpoint per ottenere la lista dei To-Do
app.get("/todo", (req, res) => {
    res.json({todos: todos});
});

// Endpoint per completare un To-Do
app.put("/todo/complete", (req, res) => {
    const { id } = req.body;
    const todo = todos.find(t => t.id === id);
    if (!todo) {
        return res.status(404).json({ error: "TODO non trovato" });
    }
    todo.completed = !todo.completed;
    res.json({ result: "Ok" });
});


// Endpoint per eliminare un To-Do
app.delete("/todo/:id", (req, res) => {
    todos.splice(0, todos.length, ...todos.filter((element) => element.id !== req.params.id));
    res.json({result: "Ok"});
});

app.use((req, res, next) => {
    console.log(`📥 Richiesta ricevuta: ${req.method} ${req.url}`);
    next();
});

const server = http.createServer(app);
server.listen(PORT, () => console.log(`Server in esecuzione su http://localhost:${PORT}`));