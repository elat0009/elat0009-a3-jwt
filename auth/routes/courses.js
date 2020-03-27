const sanitizeBody = require('../middleware/sanitizeBody')
const Course = require('../models/Course')
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  const courses = await Course.find().populate('owner')
  res.send({ data: courses })
})

router.post('/', sanitizeBody, async (req, res) => {
  let newCourse = new Course(req.sanitizeBody)
  try {
    await newCourse.save()
    res.status(201).send({ data: newCourse })
  } catch (err) {
    res.status(500).send({
      errors: [
        {
          status: 'Server error',
          code: '500',
          title: 'Problem saving document to the database.'
        }
      ]
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('owner')
    if (!course) throw new Error('Resource not found')
    res.send({ data: course })
  } catch (err) {
    sendResourceNotFound(req, res)
  }
})

const update = (overwrite = false) => async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
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
    const course = await Course.findByIdAndRemove(req.params.id)
    if (!course) throw new Error('Resource not found')
    res.send({ data: course })
  } catch (err) {
    sendResourceNotFound(req, res)
  }
})

function sendResourceNotFound (req, res) {
  console.error(err)
  res.status(404).send({
    error: [
      {
        status: 'Not Found',
        code: '404',
        title: 'Resource does nto exist',
        description: `We could not find a car with id: ${req.params.id}`
      }
    ]
  })
}

module.exports = router
