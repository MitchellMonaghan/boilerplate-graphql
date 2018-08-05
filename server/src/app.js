import config from '@config'
import mongoose from 'mongoose'

// import authenticationServer from '@services/authenticationServer'
import graphqlServer from '@services/graphql'

// Connect to database
mongoose.connect(config.mongoURI, { useNewUrlParser: true })
mongoose.connection.once('open', () => {
  console.log('Conected to database')
})

graphqlServer.listen({ port: config.port }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
