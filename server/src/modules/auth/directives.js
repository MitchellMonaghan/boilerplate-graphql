import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, UserInputError } from 'apollo-server'

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
    // TODO: I assume I need to call this resolve if the field is another object
    const { resolve } = field

    field.resolve = async function (...args) {
      const [parent, , context, field] = args
      let createdBy = parent.createdBy

      if (field.parentType.name === 'User') {
        createdBy = parent.id
      }

      if (createdBy === context.user.id) {
        return resolve ? resolve.apply(this, args) : parent[field.fieldName]
      }

      if (field.parentType._isOwnerFieldsWrapped) {
        throw new UserInputError(`You are not the owner of that ${field.parentType.name}`)
      } else {
        throw new UserInputError(`You do not have permission to access ${field.fieldName} on ${field.parentType.name}`, {
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
