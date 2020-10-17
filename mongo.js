const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const pass = process.argv[2]
const url = 
  `mongodb+srv://koliber55:${pass}@cluster0.bnip9.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(
  url,
  {useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true}
)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = new mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  console.log('Phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name + ' ' + person.number)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })
  person.save().then(result => {
    console.log(`${person.name} added to Phonebook.`)
    mongoose.connection.close()
  })
} else {
  console.log('Wrong numbers of parameters provided. Exiting.');
}
