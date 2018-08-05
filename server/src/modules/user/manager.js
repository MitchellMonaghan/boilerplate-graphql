
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
  const { id, firstName, lastName } = args.user
  // TODO: if changing user name ensure username doesn't already exist
  // TODO: You cannot update a user with a greater update permission than you
  // username
  let updatedUser = User.findByIdAndUpdate(id, {
    firstName,
    lastName
  }, { new: true }).exec()

  return updatedUser
}

const deleteUser = async (args, user) => {
  return User.delete({ _id: args.id }, user.id).exec()
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
