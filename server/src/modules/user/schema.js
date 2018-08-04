
const gql = String.raw

export const types = gql`
  type User {
    id: ID
    username: String
    firstName: String @isOwner
    lastName: String @isOwner
    email: String @isOwner
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
  getUsers: [User] @isAuthenticated
  getUser(id: ID!): User @isAuthenticated
`

export const mutations = gql`
  updateUser(user: UserInput): User @isAuthenticated @isOwner
  deleteUser(user: UserInput): User @isAuthenticated @isOwner
`

export const subscriptions = gql`
  userUpdated: User @isAuthenticated
`
