const http = require("http");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const PORT = 80;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const path = require('path');
app.use("/", express.static(path.join(__dirname, "public")));
const fs = require('fs');
const mysql = require('mysql2');
const conf = JSON.parse(fs.readFileSync('conf.json'));
conf.ssl.ca = fs.readFileSync(path.join(__dirname, conf.ssl.ca));
const connection = mysql.createConnection(conf);

const todos = []; // Lista dei task

// Endpoint per aggiungere un nuovo To-Do
app.post("/todo/add", async (req, res) => {
    try {
        const todo = req.body;
        console.log("Ricevuto nuovo todo:", todo);
        await insertTodoTabella(todo);
        res.json({ result: "Ok" });
    } catch (err) {
        res.status(500).json({ error: "Errore nell'inserimento della To-Do" });
    }
});

// Endpoint per ottenere la lista dei To-Do
app.get("/todo", async (req, res) => {
    try {
        const result = await selectTodoTabella();
        res.json({ todos: result });
    } catch (err) {
        res.status(500).json({ error: "Errore nel recupero delle To-Do" });
    }
});

// Endpoint per completare un To-Do
app.put("/todo/complete", async (req, res) => {
    try {
        const { id, completed } = req.body;
        await updateTodoTabella({ id, completed });
        res.json({ result: "Ok" });
    } catch (err) {
        res.status(500).json({ error: "Errore nell'aggiornamento della To-Do" });
    }
});

// Endpoint per eliminare un To-Do
app.delete("/todo/:id", async (req, res) => {
    try {
        let id = req.params.id
        await deleteTodoTabella(id);
        res.json({ result: "Ok" });
    } catch (err) {
        res.status(500).json({ error: "Errore nella cancellazione della To-Do" });
    }
});

app.use((req, res, next) => {
    console.log(`📥 Richiesta ricevuta: ${req.method} ${req.url}`);
    next();
});

//funzione che esegue la query al database
const executeQueryTodoTabella = (sql) => {
    return new Promise((resolve, reject) => {      
          connection.query(sql, function (err, result) {
             if (err) {
                console.error(err);
                reject();     
             }   
             console.log('done');
             resolve(result);         
       });
    })
}

//creazione tabella todo nel caso non esiste
const createTableTodoTabella = () => {
    return executeQueryTodoTabella(`
    CREATE TABLE IF NOT EXISTS todo
       ( id INT PRIMARY KEY AUTO_INCREMENT, 
          name VARCHAR(255) NOT NULL, 
          completed BOOLEAN ) 
       `);      
}

//inserimento di una todo
const insertTodoTabella = (todo) => {
    const template = `
    INSERT INTO todo (name, completed) VALUES ('$NAME', '$COMPLETED')
       `;
    let sql = template.replace("$NAME", todo.name);
    sql = sql.replace("$COMPLETED", todo.completed ? 1 : 0);
    return executeQueryTodoTabella(sql)
}

//seleziona la todo nella tabella per fare operazioni
const selectTodoTabella = () => {
    const sql = `
    SELECT id, name, completed FROM todo 
       `;
    return executeQueryTodoTabella(sql); 
}

//modifica
const updateTodoTabella = (todo) => {
    const template = `
    UPDATE todo
    SET completed= $completato
    WHERE id= $id
       `;
    let sql = template.replace("$id", todo.id);
    sql = sql.replace("$completato", 1);
    return executeQueryTodoTabella(sql); 
}

//cancella
const deleteTodoTabella = (todo) => {
    const template = `
    DELETE FROM todo
    WHERE id= $id
       `;
    let sql = template.replace("$id", todo);
    return executeQueryTodoTabella(sql); 
}

const server = http.createServer(app);
server.listen(PORT, async () => {await createTableTodoTabella(); console.log(`Server in esecuzione su http://localhost:${PORT}`)});