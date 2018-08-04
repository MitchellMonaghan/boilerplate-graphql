
import { UserInputError } from 'apollo-server'

import User from './model'

const createUser = async (args) => {
  // TODO: validate email is a email
  // TODO: validate username is not a email
  // TODO: validate email/username are uniq
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

const getUsers = async (args, user) => {
  return User.find({})
}

const getUser = async (args, user) => {
  return User.findById(args.id)
}

const updateUser = async (args, user) => {
  // TODO: allow admins to update users
  if (args.id !== user.id) {
    throw new UserInputError('You can only modify your own account.', {
      invalidArgs: [
        'id'
      ]
    })
  }

  const { firstName, lastName, username } = args
  // TODO: if changing user name ensure username doesn't already exist
  let updatedUser = User.findByIdAndUpdate(args.id, {
    firstName,
    lastName,
    username
  }, { new: true })

  return updatedUser
}

const deleteUser = async (args, user) => {
  // TODO: Implement delete user
}

const publicProps = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
}

module.exports = publicProps
export default publicProps
