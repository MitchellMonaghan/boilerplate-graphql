import manager from './manager'

const subscriptionEvents = {
  USER_UPDATED: 'USER_UPDATED'
}

export default {
  Query: {
    getUsers: async (root, args, context, info) => manager.getUsers(args, context.user),
    getUser: async (root, args, context, info) => manager.getUser(args, context.user)
  },

  Mutation: {
    updateUser: async (root, args, context, info) => {
      const user = await manager.updateUser(args, context.user)
      context.pubSub.publish(subscriptionEvents.USER_UPDATED, { userUpdated: user })

      return user
    },

    deleteUser: async (root, args, context, info) => manager.deleteUser(args, context.user)
  },

  Subscription: {
    userUpdated: {
      subscribe: (parent, args, context) => {
        return context.pubSub.asyncIterator([subscriptionEvents.USER_UPDATED])
      }
    }
  }
}
