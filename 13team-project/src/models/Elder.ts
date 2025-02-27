import mongoose, { Schema, Document } from "mongoose";

export interface Elder extends Document {
  elid: number;
  place_name: string;
  elderly: {
    name: string;
    birthYear: number;
    gender: string;
    careLevel: string;
    weight: number;
    diseases: string;
    dementiaSymptoms: string;
    cohabitant: string;
    workplaceDetails: string;
    additionalServices: string;
    location: string;
    description: string;
  };
  careDays: string[];
  careStartHour: string;
  careEndHour: string;
  mealSupport: boolean;
  toiletSupport: boolean;
  mobilitySupport: boolean;
  hasJobPosting: boolean;
  conditions: {
    wage: number;
    days: string[];
    time: string;
  };
  jobPosting: {
    condition: string[];
    email: string;
  };
  forced: boolean;
}

const ElderSchema = new Schema<Elder>({
  elid: { type: Number, required: true, unique: true },
  place_name: { type: String, required: true },
  elderly: {
    name: { type: String, required: true },
    birthYear: { type: Number, required: true },
    gender: { type: String, required: true },
    careLevel: { type: String, required: true },
    weight: { type: Number, required: true },
    diseases: { type: String, required: true, default: "" }, // ✅ 필수값 설정
    dementiaSymptoms: { type: [String], required: true }, // ✅ 배열로 변경
    cohabitant: { type: String, required: true },
    workplaceDetails: { type: [String], required: true, default: [] }, // ✅ 필수값 설정
    additionalServices: { type: String, required: true, default: "" }, // ✅ 필수값 설정
    location: { type: String, required: true },
    description: { type: String, required: true, default: "" },
  },
  careDays: { type: [String], required: true, default: [] },
  careStartHour: { type: String, required: true, default: "00:00" },
  careEndHour: { type: String, required: true, default: "00:00" }, 
  mealSupport: { type: Boolean, default: false },
  toiletSupport: { type: Boolean, default: false },
  mobilitySupport: { type: Boolean, default: false },
  hasJobPosting: { type: Boolean, default: false },
  conditions: {
    wage: { type: Number, default: 0 },
    days: { type: [String], default: [] },
    time: { type: String, default: "" },
  },
  jobPosting: {
    condition: { type: [String], default: [] },
    email: { type: String, default: "" },
  },
  forced: { type: Boolean, default: false },
});

export default mongoose.models.Elder || mongoose.model<Elder>("Elder", ElderSchema);
