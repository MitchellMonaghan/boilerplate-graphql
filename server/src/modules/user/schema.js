
const gql = String.raw

export const types = gql`
  type User {
    id: ID!
    firstName: String
    lastName: String
    username: String!
    email: String!
  }
`

export const queries = gql``

export const mutations = gql`
  updateUser(id: ID!, firstName: String, lastName: String, username: String!, password: String): User @isAuthenticated
  deleteUser(firstName: String, lastName: String, email: String!, password: String!): User @isAuthenticated
`

export const subscriptions = gql`
  userUpdated: User
`
