require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

app = express()

app.use(express.static('build'))
app.use(express.json())

morgan.token('post', (req, resp) => {
  return req.method === "POST" ? JSON.stringify(req.body) : ''
})
app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms :post'
))

app.get('/info', (req, resp, next) => {
  let now = new Date()
  Person.find({})
    .then(result => 
      resp.send(
        `<div>Phonebook has ${result.length} entries.<br/>${now.toUTCString()}</div>`
      )
    ).catch(error => next(error))
})

app.get('/api/persons', (req, resp) => {
  Person.find({}).then(result => resp.json(result))
})

app.post('/api/persons', (req, resp, next) => {
  const newPerson = new Person ({...req.body})
  if (!newPerson.name) {
    return resp.status(422).json({ "error": "no name given." })
  } else if (!newPerson.number) {
    return resp.status(422).json({ "error": "no number given." })
  } else {
    console.log("checking if person with this name exists")
    Person.findOne({ 'name': newPerson.name }).then(result => {
      if (result) {
        resp.status(409).json({ "error": "name must be unique." })
      } else {
        console.log('adding new person to database')
        newPerson.save().then(result => resp.json(result))
      }
    }).catch(error => next(error))
  }
})

app.get('/api/persons/:id', (req, resp, next) => {
  Person.findById(req.params.id).then(result => {
    if (result) {
      resp.json(result)
    } else {
      resp.status(404).end()
    }
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, resp, next) => {
  console.log(`PUT at ID ${req.params.id} attempted.`)
  const updatedPerson = {'number': req.body.number }
  Person.findByIdAndUpdate(req.params.id, updatedPerson, { 'new': true })
    .then(result => resp.json(result))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, resp, next) => {
  Person.findByIdAndDelete(req.params.id).then(result => {
    resp.status(204).end()
  }).catch(error => next(error))
})

const unknownEndpoint = (req, resp) => {
  resp.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, resp, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {console.log(`APP running on port ${PORT}. NICE!`)})