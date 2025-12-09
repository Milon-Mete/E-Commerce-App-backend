const express = require("express");
const router = express.Router();

const Seller = require("../models/EcommerceSeller");
const Product = require("../models/Product");

// SELLER REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await Seller.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already registered" });

        const seller = new Seller({ name, email, password });
        await seller.save();

        const sellerData = seller.toObject();
        delete sellerData.password; // Remove password

        res.json({
            message: "Seller registered successfully",
            seller: sellerData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SELLER LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const seller = await Seller.findOne({ email });
        if (!seller) return res.status(400).json({ message: "Seller not found" });

        if (seller.password !== password)
            return res.status(400).json({ message: "Invalid password" });

        const sellerData = seller.toObject();
        delete sellerData.password; // Remove password

        res.json({
            message: "Login success",
            seller: sellerData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// SELLER UPLOAD PRODUCT
router.get("/seller-products/:sellerId", async (req, res) => {
    try {
        const { sellerId } = req.params;

        const seller = await Seller.findById(sellerId).populate("uploadedProducts");

        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }

        // 3. Return ONLY the products array
        res.json(seller.uploadedProducts);

    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});


router.get("/all-sellers/:sellerId", async (req, res) => {
    try {
        const { sellerId } = req.params;
        const seller = await Seller.findById(sellerId)
        .populate({
                path: "orders.customerId",
                model: "EcommerceUser", // ⚠️ MUST match the name in mongoose.model("EcommerceUser", ...)
                select: "name email address phone city zip" // Only get these fields (security)
            })
            // 2. Get Product Details (Title, Image, Price)
            .populate({
                path: "orders.productId",
                model: "Productlists", // ⚠️ MUST match the name in mongoose.model("Productlists", ...)
                select: "title images price"
            });
        res.json(seller.orders);
    } catch (err) {
        console.error("Error fetching sellers:", err);
        res.status(500).json({ error: err.message });
    }
});


router.get("/all-sellers", async (req, res) => {
    try {
        const sellers = await Seller.find()
        res.json(sellers);
    } catch (err) {
        console.error("Error fetching sellers:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
