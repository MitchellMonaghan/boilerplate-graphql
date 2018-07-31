import config from '@config'
import mongoose from 'mongoose'
import { ApolloServer, makeExecutableSchema } from 'apollo-server'

import { authorizeUser, verifyEmail } from '@modules/auth/manager'

import typeDefs from './graphql/typeDefs'
import resolvers from './graphql/resolvers'
const schema = makeExecutableSchema({ typeDefs, resolvers })

// Connect to database
mongoose.connect(config.mongoURI, { useNewUrlParser: true })
mongoose.connection.once('open', () => {
  console.log('Conected to database')
})

const server = new ApolloServer({
  schema,
  context: async (req) => {
    const request = req.req
    let user

    if (request && request.headers.authorization) {
      user = await authorizeUser(request.headers.authorization)

      // Only do this check if a real user token was provided
      if(user) {
        // If the user is not confirmed they are only allowed to
        // access the verifyEmail query as authenticated
        const accessingVerifyEmail = request.body.query.includes(verifyEmail.name)
        user = user.confirmed || (!user.confirmed && accessingVerifyEmail) ? user : null
      }
    } else {
      // TODO: Figure out how to authenticate websocket connections
    }

    return {
      user
    }
  }
})

server.listen({ port: config.port }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
