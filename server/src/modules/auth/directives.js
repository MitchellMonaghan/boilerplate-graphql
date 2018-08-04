import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, UserInputError } from 'apollo-server'

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

class isOwner extends SchemaDirectiveVisitor {
  visitObject (objectType, test) {
    // this.isOwner(objectType)
    objectType._isOwnerFieldsWrapped = true

    const fields = objectType.getFields()

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      this.isOwner(field)
    })
  }

  visitFieldDefinition (field, details) {
    if (details.objectType._isOwnerFieldsWrapped) return

    this.isOwner(field)
  }

  isOwner (field) {
    // TODO: Allow admins to by pass is owner check
    const { resolve } = field

    field.resolve = async function (...args) {
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
        entityType = Object.keys(resolverArgs)[0]
        entity = await models[entityType].findById(resolverArgs[entityType].id)
      }

      createdBy = entity.createdBy

      if (entityType === 'user') {
        createdBy = entity.id
      }

      if (createdBy === context.user.id) {
        return resolve ? resolve.apply(this, args) : parent[field.fieldName]
      }

      if (field.parentType._hasAlreadyErrored) {
        return
      }

      if (field.parentType._isOwnerFieldsWrapped || !parent) {
        field.parentType._hasAlreadyErrored = true
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
}

// TODO: add isOwner directive
const publicProps = {
  isAuthenticated,
  isOwner
}

module.exports = publicProps
export default publicProps
