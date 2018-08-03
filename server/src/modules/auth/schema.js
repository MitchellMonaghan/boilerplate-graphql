const gql = String.raw

export const types = gql``

export const queries = gql`
  authenticateUser(username: String!, password: String!): String!
  refreshToken: String!
  forgotPassword(email: String!): String!
`

export const mutations = gql`
  registerUser(firstName: String, lastName: String, username: String, email: String!, password: String!): String!
  inviteUser(email: String!): String!
  verifyEmail: String!
`

export const subscriptions = gql``
