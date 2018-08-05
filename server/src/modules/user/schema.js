
const gql = String.raw

export const types = gql`
  type User {
    id: ID
    username: String
    firstName: String @hasPermission(permission: "update:user", value: "owner")
    lastName: String @hasPermission(permission: "update:user", value: "owner")
    email: String @hasPermission(permission: "update:user", value: "owner")
  }
`

export const queries = gql`
  getUsers: [User] @hasPermission(permission: "read:user", value: "all") @isAuthenticated
  getUser(id: ID!): User @hasPermission(permission: "read:user", value: "owner") @isAuthenticated
`

export const mutations = gql`
  updateUser(id: ID!, username: String!, firstName: String, lastName: String): User @hasPermission(permission: "update:user", value: "owner") @isAuthenticated
  deleteUser(id: ID!): User @hasPermission(permission: "update:user", value: "owner") @isAuthenticated
`

export const subscriptions = gql`
  userUpdated: User @isAuthenticated
`
