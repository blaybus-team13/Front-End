import mongoose, { Schema, model, models } from "mongoose";

// ✅ 요양보호사 스키마 정의
const CaregiverSchema = new Schema({
  role: { type: String, required: true }, 
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // ⚠️ bcrypt 해싱 필요
  name: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  experience: { type: Number, required: true },
  certification: { type: String, required: true },
  uploadedImage: { type: String, default: "" },
  hasJobPosting: { type: Boolean, default: false },
  isJobSeeking: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  jobInfo: {
    address: [{ type: String, default: [] }],
    days: [{ type: String, default: [] }],
    times: [{ type: String, default: [] }],
    hourlyWage: { type: Number, default: 0 },
  },
  intro: { type: String, default: "" },
  careerList: [{ type: String, default: [] }],
  hasCar: { type: Boolean, default: false },
  dementiaTraining: { type: Boolean, default: false },
  hasNurseCert: { type: Boolean, default: false },
  selectedNurseLevel: { type: String, default: "" },
  hasSocialWorkerCert: { type: Boolean, default: false },
});

// ✅ 기존 모델이 있으면 사용, 없으면 새로 생성
const Caregiver = models.Caregiver || model("Caregiver", CaregiverSchema);

export default Caregiver;
