import moduleLoader from '@services/moduleLoader'

const schemas = moduleLoader('./src/modules', 'schema')

const types = []
const queries = []
const mutations = []

schemas.forEach((schema) => {
  types.push(schema.types)
  queries.push(schema.queries)
  mutations.push(schema.mutations)
})

export default `
  ${types.join('\n')}

  type Query {
    ${queries.join('\n')}
  }

  type Mutation {
    ${mutations.join('\n')}
  }
`
