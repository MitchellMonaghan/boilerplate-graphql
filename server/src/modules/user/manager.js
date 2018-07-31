
import User from './model'
import mailer from '@services/mailer'

const createUser = async (args) => {
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
