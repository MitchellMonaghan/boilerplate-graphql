import { ApolloClient } from 'apollo-client'

import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import { InMemoryCache } from 'apollo-cache-inmemory'
import store from 'src/store'
const vuexStore = store()

export default ({ Vue }) => {
  const httpLink = new HttpLink({
    uri: '/graphql',
    fetch: (uri, options) => {
      options.headers.authorization = vuexStore.state.auth.token

      var initialRequest = fetch(uri, options)
      return initialRequest
    }
  })

  const wsLink = new WebSocketLink({
    uri: `ws://localhost:4000/subscriptions`,
    options: {
      reconnect: true
    }
  })

  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    httpLink
  )

  // Create the apollo client
  const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    connectToDevTools: true
  })

  Vue.prototype.$apollo = apolloClient
}
