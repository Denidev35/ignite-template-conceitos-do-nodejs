const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(404).json({ error: "User not exists"})
  }

  request.user = user

  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadExists = users.some(user => user.username === username)

  if(userAlreadExists) {
    return response.status(400).json({ error: "User already exists" })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos',  checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const createTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(createTodo)

  return response.status(201).json(createTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { user } = request

  const updateTodo = user.todos.find(updateTodo => updateTodo.id === id)

  if(!updateTodo) {
    return response.status(404).json({ error: "Todo not exists" })
  }

  updateTodo.title = title
  updateTodo.deadline = new Date(deadline)

  return response.json(updateTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  let doneTodo = user.todos.find(updateTodo => updateTodo.id === id)

  if(!doneTodo) {
    return response.status(404).json({ error: "Todo not exists" })
  }

  doneTodo.done = true

  return response.json(doneTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const deleteTodoIndex = user.todos.findIndex(deleteTodo => deleteTodo.id === id)

  if(deleteTodoIndex === -1) {
    return response.status(404).json({ error: "Todo not exists" })
  }

  user.todos.splice(deleteTodoIndex, 1)

  return response.status(204).send()
});

module.exports = app;