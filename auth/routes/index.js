const express = require('express')
const router = express.Router()
const sanitizeBody = require('../middleware/sanitizeBody')
const authorize = require('../middleware/auth')
const User = require('../../models/User')


router.get('/users/me', authorize, async (req, res) => {
      // Load the User document from the database using the `_id` in the JWT
    const user = await User.findById(req.user._id).select('-password -__v')
  // Remember to redact sensitive data like the user's password
  // Send the data back to the client.
    res.send({ data: user })
})
// Register a new user
router.post('/user', sanitizeBody, async (req, res) => 
{
    try 
    {
    let newUser = new User(req.sanitizedBody)
    const itExists = !!(await User.countDocuments({ email: newUser.email }))
    if (itExists) 
    {
        return res.status(400).send
        ({
        errors: 
        [
            {
            status: 'Bad Request',
            code: '400',
            title: 'Validation Error',
            detail: `Email address '${newUser.email}' is already registered.`,
            source: { pointer: '/data/attributes/email' }
            }
        ]
        })
    }
        await newUser.save()
        res.status(201).send({ data: newUser })
    }  catch (err) 
    {
        res.status(500).send
    ({
        errors: 
        [
        {
            status: 'Internal Server Error',
            code: '500',
            title: 'Problem saving document to the database.'
        }
        ]
    })
    }
})

  // Login a user and return an authentication token.
router.post('/tokens', sanitizeBody, async (req, res) => 
{
    const { email, password } = req.sanitizedBody
    const user = await User.authenticate(email, password)

    if (!user) 
    {
        return res.status(401).send(
        {
            errors: 
            [
            {
                status: 'Unauthorized',
                code : '401',
                title: "Incorrect username pr password"
            }
            ]
        })
    }
    // const token = jwt.sign({ _id: user._id }, 'superSecureSecret')
    res.status(201).send({ data: { token: user.generateAuthToken() } })
})

module.exports = router