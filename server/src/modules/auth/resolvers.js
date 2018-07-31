import manager from './manager'

export default {
  Query: {
    authenticateUser: async (root, args, context, info) => manager.authenticateUser(args.username, args.password),
    refreshToken: async (root, args, context, info) => manager.refreshToken(context.user)
  },

  Mutation: {
  }
}
