import manager from './manager'

export default {
  Query: {
  },

  Mutation: {
    createUser: async (root, args, context, info) => manager.createUser(args)
  }
}
