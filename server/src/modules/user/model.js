import mongoose from 'mongoose'
import mongooseBcrypt from 'mongoose-bcrypt'
import mongooseDelete from 'mongoose-delete'
import mongooseTimestamps from 'mongoose-timestamp'

export const attributes = {
  firstName: String,
  lastName: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    bcrypt: true
  },
  confirmed: { type: Boolean, default: false },
  permissions: {
    // User permissions, please see auth manager permissions enum for valid values
    // For protected fields please use the update permission
    'create:user': { type: Number, default: 2 },
    'read:user': { type: Number, default: 2 },
    'update:user': { type: Number, default: 1 }

    // Other module permissions here as needed
  }
}

const UserSchema = new mongoose.Schema(attributes, { minimize: false })
UserSchema.plugin(mongooseBcrypt, { rounds: 12 })
UserSchema.plugin(mongooseDelete, { deletedBy: true })
UserSchema.plugin(mongooseTimestamps)

export default mongoose.model('User', UserSchema)
