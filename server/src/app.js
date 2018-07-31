import config from '@config'
import mongoose from 'mongoose'
import { ApolloServer, makeExecutableSchema } from 'apollo-server'

import { authorizeUser } from '@modules/auth/manager'

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
