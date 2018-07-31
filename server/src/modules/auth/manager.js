import { AuthenticationError } from 'apollo-server'

import User from '@modules/user/model'
import jwt from 'jsonwebtoken'
import { pick } from 'lodash'

const generateJWT = async (user) => {
  const props = Object.assign({}, {
    user: pick(user, ['id'])
  })

  return jwt.sign(props, process.env.AUTH_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN })
}

const authenticateUser = async (username, password) => {
  username = username.toLowerCase().trim()

  // To lowercase stored username in query
  const user = await User.findOne({
    $or: [
      { username: { $regex: new RegExp(`^${username}`, 'i') } },
      { email: username }
    ]
  }).exec()

  if (!user) {
    // TODO: User not found, return proper http status code
    throw new Error('No user with that username')
  }

  // TODO: Invalid password, return proper http status code
  const isValid = await user.verifyPassword(password)

  if (!isValid) {
    throw new Error('Incorrect password')
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
    const decoded = jwt.verify(token, process.env.AUTH_SECRET)
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
