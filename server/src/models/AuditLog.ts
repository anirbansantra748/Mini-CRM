import mongoose, { Schema, InferSchemaType } from 'mongoose';

const AuditLogSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['create', 'update', 'delete'], required: true },
    diff: { type: Schema.Types.Mixed, required: true },
    at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export type AuditLogDoc = InferSchemaType<typeof AuditLogSchema> & { _id: string };

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
