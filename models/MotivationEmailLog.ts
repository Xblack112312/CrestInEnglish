import { Schema, model, models, Types, Document } from "mongoose";

export interface IMotivationEmailLog extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  day: string; // YYYY-MM-DD Africa/Cairo
  thresholdSeconds: number; // e.g. 7200
  createdAt: Date;
  updatedAt: Date;
}

const MotivationEmailLogSchema = new Schema<IMotivationEmailLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    day: { type: String, required: true, index: true },
    thresholdSeconds: { type: Number, required: true },
  },
  { timestamps: true }
);

MotivationEmailLogSchema.index({ user: 1, course: 1, day: 1, thresholdSeconds: 1 }, { unique: true });

export default models.MotivationEmailLog ||
  model<IMotivationEmailLog>("MotivationEmailLog", MotivationEmailLogSchema);
