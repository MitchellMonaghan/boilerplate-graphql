import config from '@config'
import uuid from 'uuid/v4'
import jwt from 'jsonwebtoken'
import { pick } from 'lodash'
import { UserInputError } from 'apollo-server'

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
    user: pick(user, ['id'])
  })

  // Sign token with a combination of authSecret and user password
  // This way both the server and the user has the ability to invalidate all tokens
  return jwt.sign(props, `${config.authSecret}${user.password}`, { expiresIn: config.tokenExipresIn })
}

const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.decode(token)
    const user = await User.findById(decoded.user.id)

    jwt.verify(token, `${config.authSecret}${user.password}`)
    return user
  } catch (error) {
    return null
  }
}

const authenticateUser = async (username, password) => {
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
  const user = await userManager.createUser(args)

  user.verifyEmailToken = await generateJWT(user)
  mailer.sendEmail(mailer.emailEnum.verifyEmail, [user.email], user)

  return 'User created, we will email you to verify your email.'
}

const inviteUser = async (args, user) => {
  args.password = uuid()
  const invitedUser = await userManager.createUser(args)

  invitedUser.verifyEmailToken = await generateJWT(invitedUser)
  mailer.sendEmail(mailer.emailEnum.invite, [invitedUser.email], { invitedUser, invitee: user })

  return `Success`
}

const forgotPassword = async (email) => {
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

// TODO: Add changePassword
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
  verifyEmail
}

module.exports = publicProps
export default publicProps
