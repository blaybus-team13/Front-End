import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
    id: string;
    name: string;
    password: string;
    role: string;
    position: string;
    phone: string;
    place_name: string;
    address_name: string;
}

const AdminSchema = new Schema<IAdmin>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true }, // 실제 환경에서는 반드시 해싱할 것
    role: { type: String, required: true },
    position: { type: String, default: "센터장" },
    phone: { type: String, required: true },
    place_name: { type: String, required: true },
    address_name: { type: String, required: true },
});

export default mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
