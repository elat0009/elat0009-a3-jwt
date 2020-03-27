const sanitizeBody = require('../middleware/sanitizeBody')
const Student = require('../models/Student')
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  const collection = await Student.find()
  res.send({ data: collection })
})

router.post('/', sanitizeBody, async (req, res) => {
  let newDocument = new Student(req.sanitizeBody)
  await newDocument.save()

  res.status(201).send({ data: newDocument })
})

router.get('/:id', async (req, res) => {
  try {
    const document = await Student.findById(req.params.id)
    if (!document) throw new Error('Resource not found')

    res.send({ data: document })
  } catch (err) {
    sendResourceNotFound(req, res)
  }
})

const update = (overwrite = false) => async (req, res) => {
  try {
    const course = await Student.findByIdAndUpdate(
      req.params.id,
      req.sanitizedBody,
      {
        new: true,
        overwrite,
        runValidators: true
      }
    )
    if (!course) throw new Error('Resource not found')
    res.send({ data: course })
  } catch (err) {
    sendResourceNotFound(req, res)
  }
}
router.put('/:id', sanitizeBody, update((overwrite = true)))
router.patch('/:id', sanitizeBody, update((overwrite = false)))

router.delete('/:id', async (req, res) => {
  try {
    const document = await Student.findByIdAndRemove(req.params.id)
    if (!document) throw new Error('Resource not found')
    res.send({ data: document })
  } catch (err) {
    sendResourceNotFound(req, res)
  }
})

function sendResourceNotFound (req, res) {
  res.status(404).send({
    error: [
      {
        status: 'Not Found',
        code: '404',
        title: 'Resource does nto exist',
        description: `We could not find a person with id: ${req.params.id}`
      }
    ]
  })
}

module.exports = router
