const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    // Array of image URLs for slider (5-6 photos)
    images: {
        type: [String],
        default: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800",
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800",
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800",
            "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800"
        ]
    },
    price: Number,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

module.exports = mongoose.model("Listing", listingSchema);