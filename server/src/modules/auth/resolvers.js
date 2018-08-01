import manager from './manager'

export default {
  Query: {
    authenticateUser: async (root, args, context, info) => manager.authenticateUser(args.username, args.password),
    refreshToken: async (root, args, context, info) => manager.refreshToken(context.user),
    forgotPassword: async (root, args, context, info) => manager.forgotPassword(args.email)
  },

  Mutation: {
    verifyEmail: async (root, args, context, info) => manager.verifyEmail(context.user)
  }
}
