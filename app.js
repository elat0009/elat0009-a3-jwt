// Don't forget to use NPM to inst'use strict'
const debug = require('debug')('week8')
require('./startup/database')()

const express = require('express')
const app = express()

app.use(express.json())
app.use(require('express-mongo-sanitize')())

app.use('/api/course', require('./routes/course'))
app.use('/api/student', require('./routes/student'))
app.use('/auth', require('./routes/auth'))


const port = process.env.PORT || 3030
app.listen(port, () => debug(`Express is listening on port ${port} ...`))
