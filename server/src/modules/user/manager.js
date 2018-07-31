
import User from './model'
import mailer from '@services/mailer'

const createUser = async (args) => {
  // TODO: Check if user exists
  // If user exists and is not verified, send verify email
  // If user exists and is verified, throw error

  const user = new User(args)
  user.confirmed = false
  user.email = user.email.toLowerCase().trim()

  if (user.username) {
    user.username = user.username.trim()
  } else {
    user.username = user.email
  }

  const newUser = await user.save()

  mailer.sendEmail(mailer.emailEnum.verifyEmail, [user.email], user)
  return newUser
}

const publicProps = {
  createUser
}

module.exports = publicProps
export default publicProps
