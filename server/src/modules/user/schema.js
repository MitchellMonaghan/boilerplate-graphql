
const gql = String.raw

export const types = gql`
  type User {
    id: ID
    username: String
    firstName: String @hasPermission(permission: "update:user", value: "owner")
    lastName: String @hasPermission(permission: "update:user", value: "owner")
    email: String @hasPermission(permission: "update:user", value: "owner")
  }

  input UserInput {
    id: ID!,
    username: String
    firstName: String
    lastName: String
    email: String
    password: String
  }
`

export const queries = gql`
  getUsers: [User] @isAuthenticated @hasPermission(permission: "read:user", value: "all")
  getUser(id: ID!): User @isAuthenticated @hasPermission(permission: "read:user", value: "owner")
`

export const mutations = gql`
  updateUser(user: UserInput): User @isAuthenticated @hasPermission(permission: "update:user", value: "owner")
  deleteUser(user: UserInput): User @isAuthenticated @hasPermission(permission: "update:user", value: "owner")
`

export const subscriptions = gql`
  userUpdated: User @isAuthenticated
`
