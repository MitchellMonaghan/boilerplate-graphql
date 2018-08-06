
import { UserInputError } from 'apollo-server'

import Joi from '@services/joi'

import User from './model'

const createUser = async (args) => {
  let userInDatabase = await User.findOne({ email: args.email }).exec()

  if (!userInDatabase) {
    // User doesn't exist, create a new user
    const user = new User(args)
    user.confirmed = false
    user.email = user.email.toLowerCase().trim()

    if (user.username) {
      const userNameExists = await User.findOne({ username: user.username }).exec()

      if (userNameExists) {
        throw new UserInputError('Username has already been taken', {
          invalidArgs: [
            'username'
          ]
        })
      }

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
  return User.find({}).exec()
}

const getUser = async (id, user) => {
  const validationSchema = {
    id: Joi.string().required()
  }

  Joi.validate({ id }, validationSchema)

  return User.findById(id).exec()
}

const updateUser = async (args, user) => {
  const validationSchema = {
    id: Joi.string().required(),
    username: Joi.string().required(),
    firstName: Joi.string(),
    lastName: Joi.string()
  }

  Joi.validate(args, validationSchema)

  const { id, username } = args
  delete args.id

  const userNameExists = await User.findOne({ username }).exec()

  if (userNameExists && user.id !== userNameExists.id) {
    throw new UserInputError('Username has already been taken', {
      invalidArgs: [
        'username'
      ]
    })
  }

  const userToBeUpdated = await User.findById(id).exec()

  if (userToBeUpdated.username === username) {
    delete args.username
  } else {
    Joi.validate(args.username, Joi.string().alphanum())
  }

  if (userToBeUpdated.permissions['update:user'] > user.permissions['update:user']) {
    throw new UserInputError('You can not update a user who has a higher level permission than you.', {
      invalidArgs: [
        'id'
      ]
    })
  }

  let updatedUser = await User.findByIdAndUpdate(id, args, { new: true }).exec()

  return updatedUser
}

const deleteUser = async (id, user) => {
  const validationSchema = {
    id: Joi.string().required()
  }

  Joi.validate({ id }, validationSchema)

  return User.delete({ _id: id }, user.id).exec()
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
