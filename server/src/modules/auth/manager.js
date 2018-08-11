import config from '@config'
import uuid from 'uuid/v4'
import jwt from 'jsonwebtoken'
import { pick } from 'lodash'
import { AuthenticationError, UserInputError } from 'apollo-server'

import Joi from '@services/joi'
import mailer from '@services/mailer'

import User from '@modules/user/model'
import userManager from '@modules/user/manager'

// Private functions

// End private functions

// Public functions
const permissionsEnum = {
  none: 0, // no access
  owner: 1, // access owner only
  all: 2, // access all of a collection
  super: 3 // super user who cannot be tampered with
}

const generateJWT = async (user) => {
  const props = Object.assign({}, {
    user: pick(user, ['id', 'username', 'email', 'firstName', 'lastName', 'lastPasswordChange'])
  })

  // Sign token with a combination of authSecret and user password
  // This way both the server and the user has the ability to invalidate all tokens
  return jwt.sign(props, `${config.authSecret}`, { expiresIn: config.tokenExipresIn })
}

const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.decode(token)
    const user = await User.findById(decoded.user.id).exec()
    jwt.verify(token, `${config.authSecret}`)

    if (decoded.user.lastPasswordChange !== user.lastPasswordChange.toISOString()) {
      throw new AuthenticationError('Token invalid please authenticate.')
    }

    return user
  } catch (error) {
    return null
  }
}

const authenticateUser = async (username, password) => {
  const validationSchema = {
    username: Joi.string().required(),
    password: Joi.string().required()
  }

  Joi.validate({ username, password }, validationSchema)

  username = username.toLowerCase().trim()

  // Searching on username case insensitive
  const user = await User.findOne({
    $or: [
      { username: { $regex: new RegExp(`^${username}`, 'i') } },
      { email: username }
    ]
  }).exec()

  // You can only login if confirmed
  if (!user || (user && !user.confirmed)) {
    throw new UserInputError('Username or email not found', {
      invalidArgs: [
        'username',
        'email'
      ]
    })
  }

  const isValid = await user.verifyPassword(password)

  if (!isValid) {
    return new UserInputError('Incorrect password', {
      invalidArgs: [
        'password'
      ]
    })
  }

  return generateJWT(user)
}

const refreshToken = async (user) => {
  return generateJWT(user)
}

const registerUser = async (args) => {
  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    username: Joi.string().alphanum(),
    password: Joi.string().regex(config.passwordRegex).required()
  }

  Joi.validate(args, validationSchema)

  const user = await userManager.createUser(args)

  user.verifyEmailToken = await generateJWT(user)
  mailer.sendEmail(mailer.emailEnum.verifyEmail, [user.email], user)

  return 'User created, we will email you to verify your email.'
}

const inviteUser = async (email, user) => {
  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
  }

  Joi.validate({ email }, validationSchema)

  const invitedUser = await userManager.createUser({ email, password: uuid() })

  invitedUser.verifyEmailToken = await generateJWT(invitedUser)
  mailer.sendEmail(mailer.emailEnum.invite, [invitedUser.email], { invitedUser, invitee: user })

  return `Success`
}

const forgotPassword = async (email) => {
  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
  }

  Joi.validate({ email }, validationSchema)

  const user = await User.findOne({ email }).exec()

  if (!user || (user && !user.confirmed)) {
    throw new UserInputError('Email not found', {
      invalidArgs: [
        'email'
      ]
    })
  }

  user.forgotPasswordToken = await generateJWT(user)

  mailer.sendEmail(mailer.emailEnum.forgotPassword, [email], user)
  return 'Email sent'
}

const verifyEmail = async (user) => {
  user.confirmed = true
  user.save()

  return 'Success'
}

const changePassword = async (id, password, user) => {
  const validationSchema = {
    id: Joi.string().required(),
    password: Joi.string().regex(config.passwordRegex).required()
  }

  Joi.validate({ id, password }, validationSchema)

  let updatedUser = await User.findByIdAndUpdate(id, {
    password,
    lastPasswordChange: new Date()
  }, { new: true }).exec()

  return generateJWT(updatedUser)
}
// End public functions

const publicProps = {
  permissionsEnum,
  generateJWT,
  getUserFromToken,
  authenticateUser,
  refreshToken,
  registerUser,
  inviteUser,
  forgotPassword,
  verifyEmail,
  changePassword
}

module.exports = publicProps
export default publicProps
