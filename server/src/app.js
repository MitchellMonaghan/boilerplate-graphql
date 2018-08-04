import config from '@config'
import mongoose from 'mongoose'
import { ApolloServer, makeExecutableSchema } from 'apollo-server'
import { get } from 'lodash'

import pubSub from '@services/pubSub'

import { getUserFromToken, verifyEmail } from '@modules/auth/manager'

import typeDefs from './graphql/typeDefs'
import resolvers from './graphql/resolvers'
import schemaDirectives from './graphql/schemaDirectives'
const schema = makeExecutableSchema({ typeDefs, resolvers, schemaDirectives })

// Connect to database
mongoose.connect(config.mongoURI, { useNewUrlParser: true })
mongoose.connection.once('open', () => {
  console.log('Conected to database')
})

const server = new ApolloServer({
  schema,
  context: async ({ req, connection }) => {
    let user
    let token
    let accessingVerifyEmail = false

    if (get(req, 'headers.authorization')) {
      token = req.headers.authorization
      accessingVerifyEmail = req.body.query.includes(verifyEmail.name)
    } else if (get(connection, 'context.authorization')) {
      token = connection.context.authorization
    }

    if (token) {
      user = await getUserFromToken(token)

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
  }
})

// TODO: Add logging winston/morgan
server.listen({ port: config.port }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
