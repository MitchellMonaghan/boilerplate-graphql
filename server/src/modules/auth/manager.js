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
  if (user) {
    user.confirmed = true
    user.save()
  } else {
    throw new AuthenticationError('Token invalid please signup again.')
  }

  return 'Email confirmed'
}

const publicProps = {
  generateJWT,
  getUserFromToken,
  authenticateUser,
  refreshToken,
  forgotPassword,
  verifyEmail
}

module.exports = publicProps
export default publicProps
