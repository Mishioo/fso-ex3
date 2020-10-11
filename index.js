const express = require('express')
const morgan = require('morgan')

app = express()

app.use(express.static('build'))
app.use(express.json())

morgan.token('post', (req, resp) => {
  return req.method === "POST" ? JSON.stringify(req.body) : ''
})
app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms :post'
))

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

app.get('/info', (req, resp) => {
  let now = new Date()
  resp.send(
    `<div>Phonebook has ${persons.length} entries.<br/>${now.toUTCString()}</div>`
  )
})

app.get('/api/persons', (req, resp) => {
  resp.json(persons)
})

app.post('/api/persons', (req, resp) => {
  const newPerson = {...req.body, 'id': Math.floor(Math.random() * 10000)}
  if (!newPerson.name) {
    return resp.status(422).json({ "error": "no name given." })
  } else if (!newPerson.number) {
    return resp.status(422).json({ "error": "no number given." })
  } else if (persons.find(p => p.name === newPerson.name)) {
    return resp.status(409).json({ "error": "name must be unique." })
  } else {
    persons = persons.concat(newPerson)
    return resp.json(newPerson)
  }
})

app.get('/api/persons/:id', (req, resp) => {
  const id = req.params.id
  const person = persons.find(p => p.id === id)
  if (person) {
    resp.json(person)
  } else {
    resp.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, resp) => {
  const id = parseInt(req.params.id, 10)
  persons = persons.filter(p =>p.id !== id)
  resp.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {console.log(`APP running on port ${PORT}. NICE!`)})