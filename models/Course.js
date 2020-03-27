const Student = require('./Student')
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  make: String,
  model: String,
  colour: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' }
})
const Model = mongoose.model('Course', schema)

module.exports = Model
