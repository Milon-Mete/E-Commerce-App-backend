const express = require("express");
const router = express.Router();

const User = require("../models/EcommerceUser");
const Product = require("../models/Product");
const Seller = require("../models/EcommerceSeller")



// USER REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already registered" });

        const user = new User({ name, email, password });
        await user.save();

        res.json({ message: "User registered successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// USER LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (user.password !== password)
            return res.status(400).json({ message: "Invalid password" });

        res.json({ message: "Login success", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET USER PROFILE
router.get("/profile/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/users/names", async (req, res) => {
    try {
        const users = await User.find({}); 
        // only return the 'name' field

        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put("/update/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        zip: req.body.zip
      },
      { new: true }
    );

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});



// BUY PRODUCT
router.post("/buy-product/:userId", async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const { userId } = req.params;

        const product = await Product.findOne({ _id: productId });
        if (!product) return res.status(404).json({ message: "Product not found" }); // ✅ Stops execution

        // 2. STOCK CHECK & UPDATE (The part you asked for)
        if (product.stock < quantity) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        // Reduce the stock
        product.stock = product.stock - quantity;
        
        // Save the updated product to database
        await product.save();

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const sellerId = product.seller?.id; 

        if (sellerId) {
            await Seller.findByIdAndUpdate(sellerId, {
                $push: {
                    orders: {
                        customerId: userId,    // 👈 We save WHO bought it
                        productId: productId,  // 👈 We save WHAT they bought
                        quantity: quantity,    // 👈 We save HOW MANY
                        createdAt: new Date()  // 👈 We save WHEN
                    }
                }
            });
            console.log(`Order notified to Seller: ${sellerId}`);
        }
        // Generate random time (5–20 seconds for demo)
        const randomSeconds = Math.floor(Math.random() * 15) + 5;

        const order = {
            productId,
            quantity,
            fullProduct: product,
            orderDate: new Date(),
            expectedCompletion: new Date(Date.now() + randomSeconds * 1000),
            status: "pending"
        };

        user.orders.push(order);
        await user.save();

        // Schedule automatic move
        setTimeout(async () => {
            const freshUser = await User.findById(userId);

            const selectedOrder = freshUser.orders.find(o => o.productId === productId && o.status === "pending");

            if (!selectedOrder) return;

            // Move to buyProducts
            freshUser.buyProducts.push({
                productId,
                fullProduct: product,
                completedAt: new Date()
            });

            // Mark order completed
            selectedOrder.status = "completed";

            await freshUser.save();
            console.log("Order completed & moved for user:", userId);

        }, randomSeconds * 1000);

        res.json({
            message: "Order placed successfully",
            orderAdded: order,
            randomSeconds
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
