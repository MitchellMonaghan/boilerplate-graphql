import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { ApolloServer, makeExecutableSchema } from 'apollo-server'

import { authorizeUser } from '@modules/auth/manager'

import typeDefs from './graphql/typeDefs'
import resolvers from './graphql/resolvers'
const schema = makeExecutableSchema({ typeDefs, resolvers })

dotenv.config()

// Connect to database
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
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

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
