const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Provide Product Name"],
    trim: true,
    maxLength: [100, "Product Cannot Exceed 100 Characters"],
  },
  price: {
    type: Number,
    default: 0.0,
  },
  description: {
    type: String,
    required: [true, "Please Provide Proper Description"],
  },
  rating: {
    type: Number,
    default: 0,
  },
  images: [
    {
      image: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please enter Product Category"],
    enum: {
      values: [
        "Electronics",
        "Mobile Phones",
        "Laptops",
        "Accessories",
        "Headphones",
        "Foods",
        "Books",
        "Clothes/Shoes",
        "Beauty/Health",
        "Sports",
        "Outdoor",
        "Home",
      ],
      message: "Please Select Correct Category",
    },
  },
  seller: {
    type: String,
    required: [true, "Please enter product seller"],
  },
  stock: {
    type: Number,
    required: [true, "Please Enter Product Stock"],
    max: [20, "Product Stock Cannot exceed 20"], // Corrected typo here
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user:
  {
    type:mongoose.Schema.Types.ObjectId
  },
  createdAt: {
    type: Date,
    default: Date.now(), // Corrected typo here
  },
});

// Create a model using the schema
const schema  = mongoose.model("Product", productSchema);

// Export the model
module.exports = schema;
