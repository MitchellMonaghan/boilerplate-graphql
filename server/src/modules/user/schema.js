
const gql = String.raw

export const types = gql`
  type User {
    id: ID!
    username: String!
    firstName: String @isOwner
    lastName: String @isOwner
    email: String @isOwner
  }
`

export const queries = gql`
  getUsers: [User] @isAuthenticated
  getUser(id: ID!): User @isAuthenticated
`

export const mutations = gql`
  updateUser(id: ID!, firstName: String, lastName: String, username: String!, password: String): User @isAuthenticated
  deleteUser(firstName: String, lastName: String, email: String!, password: String!): User @isAuthenticated
`

export const subscriptions = gql`
  userUpdated: User @isAuthenticated
`
