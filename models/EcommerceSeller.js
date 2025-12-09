const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    uploadedProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Productlists"
        }
    ],
    listedProduct : [Object],
    orders: [
        {
            customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'EcommerceUser' },
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Productlists' },
            quantity: Number,
            createdAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("EcommerceSeller", sellerSchema);
