
import { merge } from 'lodash'
import moduleLoader from '@root/src/moduleLoader'
import typeDefs from './schema'

const moduleResolvers = moduleLoader('./src/modules', 'resolvers')

const resolvers = {}
moduleResolvers.forEach(resolver => {
  merge(resolvers, resolver.default)
})

export default { typeDefs, resolvers }
