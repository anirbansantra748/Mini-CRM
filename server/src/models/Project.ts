import mongoose, { Schema, InferSchemaType, Types } from 'mongoose';
import { Status } from './enums.js';

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    client: { type: String, required: true },
    budget: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(Status), default: Status.LEAD },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  },
  { timestamps: true }
);

export type ProjectDoc = InferSchemaType<typeof ProjectSchema> & { _id: string };

export const Project = mongoose.model('Project', ProjectSchema);
