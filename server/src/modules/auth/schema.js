const gql = String.raw

export const types = gql``

export const queries = gql`
  authenticateUser(username: String!, password: String!): String!
  refreshToken: String!
`

export const mutations = gql``

export const subscriptions = gql``
