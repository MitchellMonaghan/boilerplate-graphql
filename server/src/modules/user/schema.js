
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
  updateUser(firstName: String, lastName: String, email: String!, password: String!): User
  deleteUser(firstName: String, lastName: String, email: String!, password: String!): User
`

export const subscriptions = gql``
