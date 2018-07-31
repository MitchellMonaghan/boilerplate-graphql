import config from '@config'
import { AuthenticationError, UserInputError } from 'apollo-server'

import User from '@modules/user/model'
import jwt from 'jsonwebtoken'
import { pick } from 'lodash'

const generateJWT = async (user) => {
  const props = Object.assign({}, {
    user: pick(user, ['id'])
  })

  return jwt.sign(props, config.authSecret, { expiresIn: config.tokenExipresIn })
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

  if (!user) {
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

const authorizeUser = async (token) => {
  try {
    const decoded = jwt.verify(token, config.authSecret)
    return await User.findById(decoded.user.id)
  } catch (error) {
    return null
  }
}

const publicProps = {
  authenticateUser,
  refreshToken,
  authorizeUser
}

module.exports = publicProps
export default publicProps
