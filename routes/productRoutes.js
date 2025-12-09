const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Seller = require("../models/EcommerceSeller");

// Fetch All
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Product
router.post("/", async (req, res) => {
    try {
        console.log("Received product:", req.body); // DEBUG

        const product = new Product(req.body);
        const savedProduct = await product.save();
        const sellerId = savedProduct.seller?.id;
        if (sellerId) {
            await Seller.findByIdAndUpdate(
                sellerId,
                {
                    $push: {
                        uploadedProducts: savedProduct._id,
                        listedProduct: savedProduct
                    }

                },
                { new: true } // Standard option to return updated doc (optional here)
            );
            console.log(`Added Product ${savedProduct._id} to Seller ${sellerId}`);
        }
        res.json(savedProduct);
    } catch (err) {
        console.error("Product Save Error:", err); // DEBUG
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
