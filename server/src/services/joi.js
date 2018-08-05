import Joi from 'joi'
import { UserInputError } from 'apollo-server'

const validate = Joi.validate

Joi.validate = (data, validationSchema) => {
  const { error } = validate(data, validationSchema)

  if (error) {
    throw new UserInputError(error.details[0].message, {
      invalidArgs: [
        error.details[0].context.key
      ]
    })
  }
}

module.exports = Joi
export default Joi
