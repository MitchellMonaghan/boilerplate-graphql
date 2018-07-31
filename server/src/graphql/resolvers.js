
import { merge } from 'lodash'
import moduleLoader from '@services/moduleLoader'

const moduleResolvers = moduleLoader('./src/modules', 'resolvers')

const resolvers = {}
moduleResolvers.forEach(resolver => {
  merge(resolvers, resolver.default)
})

export default resolvers
