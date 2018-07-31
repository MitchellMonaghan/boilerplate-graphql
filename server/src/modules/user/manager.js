
import User from './model'
import crypto from 'crypto'
import mailer from '@services/mailer'

const createUser = async (args) => {
  const user = new User(args)
  user.email = user.email.toLowerCase().trim()

  if (user.username) {
    user.username = user.username.trim()
  } else {
    user.username = user.email
  }

  user.confirmed = false

  // TODO: This token could be a jwt like object that has the confirmation date sent in it
  user.confirmationToken = crypto.randomBytes(10).toString('hex')

  const newUser = await user.save()

  mailer.sendEmail(mailer.emailEnum.verifyEmail, [user.email], user)
  return newUser
}

const publicProps = {
  createUser
}

module.exports = publicProps
export default publicProps
