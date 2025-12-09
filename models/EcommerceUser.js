const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    address: String,
    city: String,
    zip: String,


    orders: [
        {
            productId: String,
            quantity:Number,
            fullProduct: Object,
            orderDate: { type: Date, default: Date.now },
            expectedCompletion: Date,  // random future time
            status: { type: String, default: "pending" }
        }
    ],

    buyProducts: [
        {
            productId: String,
            quantity:Number,
            fullProduct: Object,
            completedAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("EcommerceUser", userSchema);
