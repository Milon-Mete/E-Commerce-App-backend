const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Routes
app.use("/products", require("./routes/productRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/seller", require("./routes/sellerRoutes"));

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
