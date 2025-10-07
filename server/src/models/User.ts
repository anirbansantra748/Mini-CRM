import mongoose, { Schema, InferSchemaType } from 'mongoose';
import { Role } from './enums.js';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.MEMBER },
    name: { type: String },
    company: { type: String },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string };

export const User = mongoose.model('User', UserSchema);
