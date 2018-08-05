import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, UserInputError, ApolloError } from 'apollo-server'

import { permissionsEnum } from '@modules/auth/manager'
import user from '@modules/user/model'
const models = {
  user
}

class isAuthenticated extends SchemaDirectiveVisitor {
  visitFieldDefinition (field, details) {
    this.isAuthenticated(field)
  }

  isAuthenticated (field) {
    if (field.resolve) {
      const { resolve } = field
      field.resolve = async (...args) => {
        const [, , context] = args

        if (context.user) {
          return resolve.apply(this, args)
        }

        throw new AuthenticationError('Token invalid please authenticate.')
      }
    } else if (field.subscribe) {
      const { subscribe } = field
      field.subscribe = async (...args) => {
        const [, , context] = args

        if (context.user) {
          return subscribe.apply(this, args)
        }

        throw new AuthenticationError('Token invalid please authenticate.')
      }
    }
  }
}

class hasPermission extends SchemaDirectiveVisitor {
  visitObject (objectType, test) {
    objectType._isOwnerFieldsWrapped = true

    const fields = objectType.getFields()

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      this.hasPermission(field)
    })
  }

  visitFieldDefinition (field, details) {
    this.hasPermission(field)
  }

  hasPermission (field) {
    const { resolve } = field

    field.resolve = async (...args) => {
      const [parent, , context, field] = args
      const userPermission = context.user.permissions[this.args.permission]
      const permissionRequired = permissionsEnum[this.args.value]

      if (userPermission < permissionRequired) {
        throw new ApolloError('You do not have the sufficient permissions to do that.', '403', { status: 403 })
      } else if (permissionRequired === permissionsEnum.owner && userPermission <= permissionsEnum.owner) {
        return this.isOwner(args, resolve)
      } else {
        return resolve ? resolve.apply(this, args) : parent[field.fieldName]
      }
    }
  }

  async isOwner (args, resolve) {
    const [parent, resolverArgs, context, field] = args

    let entity
    let createdBy
    let entityType

    if (parent) {
      entityType = field.parentType.name.toLowerCase()
      entity = parent
    } else {
      // if the directive is put on a query or mutation
      // determine the entity type by the input
      entityType = this.args.permission.split(':')[1]
      entity = await models[entityType].findById(resolverArgs[entityType].id)
    }

    createdBy = entity.createdBy

    if (entityType === 'user') {
      createdBy = entity.id
    }

    if (createdBy === context.user.id) {
      return resolve ? resolve.apply(this, args) : parent[field.fieldName]
    }

    if (field.parentType._isOwnerFieldsWrapped || !parent) {
      throw new UserInputError(`You are not the owner of that ${entityType}`, {
        invalidArgs: [
          'id'
        ]
      })
    } else {
      throw new UserInputError(`You do not have permission to access ${field.fieldName} on ${entityType}`, {
        invalidArgs: [
          field.fieldName
        ]
      })
    }
  }
}

const publicProps = {
  isAuthenticated,
  hasPermission
}

module.exports = publicProps
export default publicProps
