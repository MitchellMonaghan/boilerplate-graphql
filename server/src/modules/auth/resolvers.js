import manager from './manager'

export default {
  Query: {
    refreshToken: async (root, args, context, info) => manager.refreshToken(context.user),

    authenticateUser: async (root, args, context, info) => manager.authenticateUser(args.username, args.password),
    forgotPassword: async (root, args, context, info) => manager.forgotPassword(args.email)
  },

  Mutation: {
    inviteUser: async (root, args, context, info) => manager.inviteUser(args.email, context.user),
    changePassword: async (root, args, context, info) => manager.changePassword(args.id, args.password, context.user),
    verifyEmail: async (root, args, context, info) => manager.verifyEmail(context.user),
    registerUser: async (root, args, context, info) => manager.registerUser(args)
  }
}
