import { Schema, model, models, Types, Document } from "mongoose";

export interface IWatchDaily extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  lessonId: string; // your lesson key (ex: "video:2" or "pdf:1" or actual generated id)
  day: string; // YYYY-MM-DD in Africa/Cairo
  secondsWatched: number;
  lastPosition?: number; // seconds, for resume
  createdAt: Date;
  updatedAt: Date;
}

const WatchDailySchema = new Schema<IWatchDaily>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    day: { type: String, required: true, index: true }, // "2026-02-06"
    secondsWatched: { type: Number, default: 0 },
    lastPosition: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicates for same user/course/lesson/day
WatchDailySchema.index({ user: 1, course: 1, lessonId: 1, day: 1 }, { unique: true });

export default models.WatchDaily || model<IWatchDaily>("WatchDaily", WatchDailySchema);
