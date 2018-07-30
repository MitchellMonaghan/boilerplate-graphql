export const types = `
  type User {
    id: ID!
    firstName: String
    lastName: String
    username: String!
    email: String!
  }
`

export const queries = ``

export const mutations = `
  createUser(firstName: String, lastName: String, username: String, email: String!, password: String!): User

  updateUser(firstName: String, lastName: String, email: String!, password: String!): User

  deleteUser(firstName: String, lastName: String, email: String!, password: String!): User
`

export const subscriptions = ``
