import config from '@config'
import mongoose from 'mongoose'
import { ApolloServer, makeExecutableSchema } from 'apollo-server'
import { get } from 'lodash'

import pubSub from '@services/pubSub'

import { getUserFromToken, verifyEmail } from '@modules/auth/manager'

import typeDefs from './graphql/typeDefs'
import resolvers from './graphql/resolvers'
import schemaDirectives from './graphql/schemaDirectives'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives
})

// Connect to database
mongoose.connect(config.mongoURI, { useNewUrlParser: true })
mongoose.connection.once('open', () => {
  console.log('Conected to database')
})

const server = new ApolloServer({
  schema,
  context: async ({ req, connection }) => {
    let user
    let authToken
    let accessingVerifyEmail = false

    if (get(req, 'headers.authorization')) {
      authToken = req.headers.authorization
      accessingVerifyEmail = req.body.query.includes(verifyEmail.name)
    } else if (get(connection, 'context.authorization')) {
      authToken = connection.context.authorization
    }

    if (authToken) {
      user = await getUserFromToken(authToken)

      // Only do this check if a real user token was provided
      if (user) {
        // If the user is not confirmed they are only allowed to
        // access the verifyEmail query as authenticated
        user = user.confirmed || (!user.confirmed && accessingVerifyEmail) ? user : null
      }
    }

    return {
      user,
      pubSub
    }
  },
  subscriptions: {
    onConnect: async (connectionParams, webSocket, context) => {
      if (connectionParams.authToken) {
        let user = await getUserFromToken(connectionParams.authToken)
        user = get(user, 'confirmed') ? user : null
        context.user = user
      }

      return context
    },

    onDisconnect: async (webSocket, context) => {
      // ...
    }
  },
  engine: {
    apiKey: config.apolloEngineAPIKey
  }
})

server.listen({ port: config.port }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
