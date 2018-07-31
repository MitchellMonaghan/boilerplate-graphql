import dotenv from 'dotenv'
dotenv.config()

export default {
  env: process.env.NODE_ENV || 'development',

  port: process.env.PORT || 4000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',

  authSecret: process.env.AUTH_SECRET,
  tokenExipresIn: process.env.TOKEN_EXPIRES_IN || '3d',

  mailgunAPIKey: process.env.MAILGUN_API_KEY,
  mailgunDomain: process.env.MAILGUN_DOMAIN,
  mailgunSender: process.env.MAILGUN_SENDER
}
