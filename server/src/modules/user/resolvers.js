import manager from './manager'

export default {
  Query: {
  },

  Mutation: {
    updateUser: async (root, args, context, info) => manager.updateUser(args),
    deleteUser: async (root, args, context, info) => manager.deleteUser(args)
  }
}
