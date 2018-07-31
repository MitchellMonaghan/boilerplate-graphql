import config from '@config'
import mailgun from 'mailgun-js'

// Templates
import verifyEmail from './templates/verifyEmail'
import forgotPassword from './templates/forgotPassword'

const emailTemplates = {
  verifyEmail,
  forgotPassword
}

const mailgunClient = mailgun({
  apiKey: config.mailgunAPIKey,
  domain: config.mailgunDomain
})

const sendEmail = (templateName, recipients, data) => {
  let email = emailTemplates[templateName](data)
  email.from = config.mailgunSender
  email.to = recipients.join(',')

  mailgunClient.messages().send(email, function (error, body) {
    if (error) {
      console.log(error)
    }

    console.log(body)
  })
}

const emailEnum = {}
Object.keys(emailTemplates).forEach(key => {
  emailEnum[key] = key
})

const publicProps = {
  emailEnum,
  sendEmail
}

module.exports = publicProps
export default publicProps
