
import { UserInputError } from 'apollo-server'

import User from './model'

const createUser = async (args) => {
  // TODO: validate args.email
  let userInDatabase = await User.findOne({ email: args.email }).exec()

  if (!userInDatabase) {
    // User doesn't exist, create a new user
    const user = new User(args)
    user.confirmed = false
    user.email = user.email.toLowerCase().trim()

    if (user.username) {
      user.username = user.username.trim()
    } else {
      user.username = user.email
    }

    userInDatabase = await user.save()
  } else if (userInDatabase && !userInDatabase.confirmed) {
    // If user exists and is not verified, save the new password and send verify email
    userInDatabase.password = args.password
    userInDatabase.save()
  } else if (userInDatabase && userInDatabase.confirmed) {
    // If user exists and is verified, throw error
    throw new UserInputError('Email has already been registered', {
      invalidArgs: [
        'email'
      ]
    })
  }

  return userInDatabase
}

const publicProps = {
  createUser
}

module.exports = publicProps
export default publicProps
