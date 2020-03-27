const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')



const schema = new mongoose.Schema({
    firstName: { type: String, trim: true, maxlength: 64 },
    lastName: { type: String, trim: true, maxlength: 64 },
    email: { type: String, trim: true, maxlength: 512},
    password: { type: String, trim: true, maxlength: 70 }
})

schema.methods.generateAuthToken = function () // we cannot use the arrow fucntion here so, we should use the function keyword only
{
return jwt.sign({_id: this._id}, 'superSecretSecure')
}
schema.methods.toJSON = function () {
    const obj = this.toObject()
    delete obj.password
    delete obj.__v
    return obj
}

schema.statics.authenticate = async function(email, password)
{
const user = await this.findOne({email: email})
const hashedPassword = user
? user.password 
: `$2b$${saltRounds}$invalidusernameaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` 

const passwordDidMatch = await bcrypt.compare(password, hashedPassword)

return passwordDidMatch ? user : null
}
schema.pre ('save', async function(next)
{
    if(!this.isModified('password'))

    this.password = await bcrypt.hash(this.password, saltRounds)
    next()
})

const Model = mongoose.model('User', schema) // factory function returns a class

module.exports = Model