const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  subcategory: String,
  price: {
    original: Number,
    discounted: Number,
  },
  images: {
    thumbnail: String,
    gallery: [String],
  },
  variants: {
    type: {
      type: String, // 👈 THIS defines the "type" field
      required: false
    },
    options: {
      type: [String],
      required: false
    }
  },
  colors: [String],
  stock: Number,
  tags: [String],
  seller: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true
    },
    name: String,
    email: String
  }
});

module.exports = mongoose.model("Productlists", productSchema);
