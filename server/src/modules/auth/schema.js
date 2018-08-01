const gql = String.raw

export const types = gql``

export const queries = gql`
  authenticateUser(username: String!, password: String!): String!
  refreshToken: String!
  forgotPassword(email: String!): String!
`

export const mutations = gql`
  verifyEmail: String!
`

export const subscriptions = gql``
