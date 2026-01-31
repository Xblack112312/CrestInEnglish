import { Schema, model, models, Document, Types } from "mongoose";

export interface IEnrollment extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  phone: string;
  status: "pending" | "approved" | "rejected";
  rejectingreason?: string;
  userId: string;
  paymentProof: string;
  createdAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    phone: { type: String, required: true },
    rejectingreason: { type: String },
    userId: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    paymentProof: { type: String, required: true },
  },
  { timestamps: true }
);

const Enrollment = models.Enrollment || model<IEnrollment>("Enrollment", EnrollmentSchema);
export default Enrollment;
