import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { GraphQLServer, PubSub } from 'graphql-yoga'

import { authorizeUser } from '@modules/auth/manager'

import graphql from './graphql'

dotenv.config()

// Connect to database
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
mongoose.connection.once('open', () => {
  console.log('Conected to database')
})

// Setup up the graphql context for every request
graphql.context = async (req) => {
  const request = req.request
  let user

  if (request && request.headers.authorization) {
    user = await authorizeUser(request.headers.authorization)
  } else {
    // TODO: Figure out how to authenticate websocket connections
  }

  return {
    user,
    pubsub: new PubSub()
  }
}

const server = new GraphQLServer(graphql)
server.start(
  {
    // Server options
    port: process.env.PORT,
    endpoint: '/graphql',
    subscriptions: '/subscriptions',
    playground: '/playground'
  },

  ({ port }) => {
    // Server start call back
    console.log(`🚀  Server ready on ${port}`)
  }
)
