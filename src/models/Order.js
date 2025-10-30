import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userPhone: { type: String, required: true },
    address :{type:String, required:true},
    pincode:{type:String,required:true},
    design: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },

    // ✅ New fields for price & total
    pricePerUnit: { type: Number, required: false, default: 0 },
    totalAmount: { type: Number, required: false, default: 0 },

    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

// ✅ Auto-calculate totalAmount before saving
orderSchema.pre("save", function (next) {
  if (this.pricePerUnit && this.quantity) {
    this.totalAmount = this.pricePerUnit * this.quantity;
  }
  next();
});

export default mongoose.model("Order", orderSchema);

