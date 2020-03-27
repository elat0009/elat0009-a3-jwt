const debug = require('debug')('week8:auth')
const User = require('../models/User');
const sanitizeBody = require('../middleware/sanitizeBody')
const express = require('express')
const router = express.Router();
const authorize = require('../middleware/auth');
const Attempt = require('../models/authentication_attempts');


router.post('/users', sanitizeBody, async (req, res) => {
try {
    let newUser = new User(req.sanitizedBody)
    const itExists = !!(await User.countDocuments({ email: newUser.email }))
    if (itExists) {
        return res.status(400).send({
        errors: [
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
    } catch (err) {
    debug('Error saving new user: ', err.message)
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

router.get('/users/me', authorize, async (req, res) => {
const user = await User.findById(req.user._id);
res.send({ data: user });
});
router.post('/tokens', sanitizeBody, async (req, res) => {
    const { email, password } = req.sanitizedBody
    try {
    let newAttempt = new Attempt({
        username: email,
        ipAddress: req.connection.remoteAddress,
        didSucceed: true,
        createAt: Date.now()
    });
    await newAttempt.save();
    const user = await User.authenticate(email, password)
    if (!user) {
        newAttempt.didSucceed = false;
        await newAttempt.save();
        return res.status(401).send({
        errors: [
        {
            status: 'Unauthorized',
            code: '401',
            title: 'Authentication failed',
            description: 'Incorrect username or password.'
        }
        ]
    })
    }
    res.status(201).send({ data: { token: user.generateAuthToken() } })
} catch (err) {
    debug(`Error authenticating user ... `, err.message)
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

module.exports = router
