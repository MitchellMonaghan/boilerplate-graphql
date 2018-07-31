import config from '@config'
import { AuthenticationError, UserInputError } from 'apollo-server'

import User from '@modules/user/model'
import jwt from 'jsonwebtoken'
import mailer from '@services/mailer'
import { pick } from 'lodash'

const generateJWT = async (user) => {
  const props = Object.assign({}, {
    user: pick(user, ['id'])
  })

  return jwt.sign(props, config.authSecret, { expiresIn: config.tokenExipresIn })
}

const authorizeUser = async (token) => {
  try {
    const decoded = jwt.verify(token, config.authSecret)
    return await User.findById(decoded.user.id)
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
  if (user) {
    return generateJWT(user)
  } else {
    throw new AuthenticationError('Token invalid please authenticate.')
  }
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

  return 'Email confirmed'
}

const publicProps = {
  authorizeUser,
  authenticateUser,
  refreshToken,
  forgotPassword,
  verifyEmail
}

module.exports = publicProps
export default publicProps
