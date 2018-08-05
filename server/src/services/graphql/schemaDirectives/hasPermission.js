import { SchemaDirectiveVisitor } from 'graphql-tools'
import { UserInputError, ApolloError } from 'apollo-server'
import { permissionsEnum } from '@modules/auth/manager'

import user from '@modules/user/model'

const models = {
  user
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
      entity = await models[entityType].findById(resolverArgs.id)
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

module.exports = hasPermission
export default hasPermission
