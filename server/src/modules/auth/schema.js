const gql = String.raw

export const types = gql``

export const queries = gql`
  refreshToken: String! @isAuthenticated

  authenticateUser(username: String!, password: String!): String!
  forgotPassword(email: String!): String!
`

export const mutations = gql`
  inviteUser(email: String!): String! @hasPermission(permission: "create:user", value: "all")
  changePassword(id: ID!, password: String!): String! @hasPermission(permission: "update:user", value: "owner")
  verifyEmail: String! @isAuthenticated
  registerUser(firstName: String, lastName: String, username: String, email: String!, password: String!): String!
`

export const subscriptions = gql``
