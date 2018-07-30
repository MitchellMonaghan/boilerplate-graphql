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
  pendingToken: String
}

const UserSchema = new mongoose.Schema(attributes, { minimize: false })
UserSchema.plugin(mongooseBcrypt, { rounds: 12 })
UserSchema.plugin(mongooseDelete)
UserSchema.plugin(mongooseTimestamps)

export default mongoose.model('User', UserSchema)
