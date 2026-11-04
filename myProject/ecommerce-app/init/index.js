const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

mongoose.connect("mongodb://127.0.0.1:27017/ecommerce")
    .then(() => console.log("Connected to DB for Seeding"))
    .catch((err) => console.log(err));

const sampleListings = [
    {
        title: "Wireless ANC Headphones",
        description: "Active noise cancelling, 30-hour playback, crystal clear sound and ergonomic design.",
        price: 4999,
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800",
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800"
        ]
    },
    {
        title: "Smart Fitness Watch",
        description: "Track steps, heart rate, SPO2 levels, and sports activities with AMOLED display.",
        price: 2999,
        images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800",
            "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800",
            "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=800",
            "https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=800"
        ]
    },
    {
        title: "Retro Vintage Camera",
        description: "Capture classic 4K moments with analog aesthetic and high-definition clarity.",
        price: 15499,
        images: [
            "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800",
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800",
            "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=800",
            "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?q=80&w=800",
            "https://images.unsplash.com/photo-1500634245200-e5245c7e73ef?q=80&w=800"
        ]
    },
    {
        title: "Pro Gaming Mouse",
        description: "16000 DPI sensor, custom RGB lighting, and programmable macro buttons.",
        price: 1899,
        images: [
            "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800",
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800",
            "https://images.unsplash.com/photo-1626218174358-7769486c4b79?q=80&w=800",
            "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?q=80&w=800",
            "https://images.unsplash.com/photo-1613141411244-0e4ac259d217?q=80&w=800"
        ]
    },
    {
        title: "Mechanical RGB Keyboard",
        description: "Tactile Blue Switches, durable aluminum body, and multi-mode RGB backlighting.",
        price: 3499,
        images: [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800",
            "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800",
            "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800",
            "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800",
            "https://images.unsplash.com/photo-1601445638532-3c6f6c3230a1?q=80&w=800"
        ]
    },
    {
        title: "Leather Urban Backpack",
        description: "Handcrafted genuine leather backpack with dedicated 15.6 inch laptop compartment.",
        price: 2499,
        images: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800",
            "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=800",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800",
            "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=800",
            "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?q=80&w=800"
        ]
    },
    {
        title: "Running Sports Shoes",
        description: "Breathable mesh upper with ultra-cushioned sole for maximum athletic performance.",
        price: 1999,
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800",
            "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800",
            "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800"
        ]
    },
    {
        title: "Portable Bluetooth Speaker",
        description: "IPX7 waterproof, deep bass punch, and 12-hour continuous party music playback.",
        price: 1499,
        images: [
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800",
            "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800",
            "https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=800",
            "https://images.unsplash.com/photo-1512446816042-444d641267d4?q=80&w=800",
            "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800"
        ]
    },
    {
        title: "Minimalist Desk Lamp",
        description: "Warm LED lighting with dimmable brightness levels and flexible goose-neck.",
        price: 899,
        images: [
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800",
            "https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=800",
            "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800",
            "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800",
            "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?q=80&w=800"
        ]
    },
    {
        title: "Polarized UV Sunglasses",
        description: "Classic aviator style with UV400 protective polarized lenses.",
        price: 1299,
        images: [
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800",
            "https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800",
            "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=800",
            "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=800"
        ]
    },
    {
        title: "Ceramic Coffee Mug Set",
        description: "Set of 4 matte ceramic mugs with heat-insulated ergonomic wooden handle.",
        price: 799,
        images: [
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800",
            "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800",
            "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=800",
            "https://images.unsplash.com/photo-1572119865084-43c285814d63?q=80&w=800",
            "https://images.unsplash.com/photo-1536939459926-301728717817?q=80&w=800"
        ]
    },
    {
        title: "Stainless Steel Water Bottle",
        description: "Vacuum insulated 1-liter flask that keeps drinks hot or cold for 24 hours.",
        price: 649,
        images: [
            "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800",
            "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?q=80&w=800",
            "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=800",
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800",
            "https://images.unsplash.com/photo-1610824352934-c10d87b700cc?q=80&w=800"
        ]
    },
    {
        title: "Wireless Charging Pad",
        description: "Fast 15W Qi wireless charger compatible with all modern smartphones.",
        price: 999,
        images: [
            "https://images.unsplash.com/photo-1622445268465-8378c6875753?q=80&w=800",
            "https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=800",
            "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800",
            "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800",
            "https://images.unsplash.com/photo-1617997455403-41f333d44d5b?q=80&w=800"
        ]
    },
    {
        title: "Casual Denim Jacket",
        description: "100% premium cotton denim jacket with modern street style fit.",
        price: 2199,
        images: [
            "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800",
            "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=800",
            "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?q=80&w=800",
            "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800",
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800"
        ]
    },
    {
        title: "Ergonomic Office Chair",
        description: "High-back mesh chair with adjustable lumbar support and 3D armrests.",
        price: 8999,
        images: [
            "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?q=80&w=800",
            "https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=800",
            "https://images.unsplash.com/photo-1589384267710-7a2528020623?q=80&w=800",
            "https://images.unsplash.com/photo-1519947486511-46149fa0a254?q=80&w=800",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800"
        ]
    },
    {
        title: "Wireless TWS Earbuds",
        description: "True wireless earbuds with low latency gaming mode and ENC microphone.",
        price: 1699,
        images: [
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800",
            "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=800",
            "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?q=80&w=800",
            "https://images.unsplash.com/photo-1631867675167-90a456a90863?q=80&w=800",
            "https://images.unsplash.com/photo-1598331668826-20cecc596b86?q=80&w=800"
        ]
    },
    {
        title: "Smart Home Security Camera",
        description: "1080p full HD night vision camera with 360-degree rotation and motion alerts.",
        price: 2299,
        images: [
            "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?q=80&w=800",
            "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=800",
            "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=800",
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800",
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"
        ]
    },
    {
        title: "Scented Soy Candle Set",
        description: "Aromatherapy lavender and vanilla scented candles for relaxation and stress relief.",
        price: 599,
        images: [
            "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800",
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800",
            "https://images.unsplash.com/photo-1572726729986-e2f7547847be?q=80&w=800",
            "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=800",
            "https://images.unsplash.com/photo-1596434300655-e48d3ff3dd5e?q=80&w=800"
        ]
    },
    {
        title: "Electric Drip Coffee Maker",
        description: "Brew rich aromatic coffee with 1.25L capacity glass carafe and keep-warm plate.",
        price: 3299,
        images: [
            "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=800",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800",
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800",
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800",
            "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800"
        ]
    },
    {
        title: "Unisex Cotton Hoodie",
        description: "Fleece-lined cozy pullover hoodie with front kangaroo pocket.",
        price: 1399,
        images: [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800",
            "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=800",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800",
            "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800"
        ]
    }
];

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(sampleListings);
    console.log("Database successfully seeded with 20 products!");
    mongoose.connection.close();
};

initDB();