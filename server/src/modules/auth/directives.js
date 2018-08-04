import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError } from 'apollo-server'

class isAuthenticated extends SchemaDirectiveVisitor {
  visitObject (type, details) {
    this.isAuthenticated(type)
  }

  visitFieldDefinition (field, details) {
    this.isAuthenticated(field)
  }

  isAuthenticated (field) {
    const { resolve } = field
    field.resolve = async (...args) => {
      const [, , context] = args

      if (context.user) {
        return resolve.apply(this, args)
      }

      throw new AuthenticationError('Token invalid please authenticate.')
    }
  }
}

// TODO: add isOwner directive
const publicProps = {
  isAuthenticated
}

module.exports = publicProps
export default publicProps
