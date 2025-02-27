import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    position: { type: String, default: "센터장" },
    phone: { type: String, required: true },
    place_name: { type: String, required: true },
    address_name: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
