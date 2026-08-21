// src/server/serverless.ts
import express from "express";

// src/server/routes/api.ts
import { Router } from "express";

// src/server/data/seed.ts
var INITIAL_SETTINGS = {
  siteName: "BazaarNova",
  logoUrl: "",
  contactEmail: "support@bazaarnova.com",
  contactPhone: "+1 (800) 842-6272",
  address: "500 Innovation Way, Tech Hub Suite 400, San Francisco, CA 94105",
  shippingCharge: 4.99,
  freeShippingAbove: 50,
  taxPercentage: 7.5,
  currency: "USD",
  currencySymbol: "$",
  socialFacebook: "https://facebook.com/bazaarnova",
  socialTwitter: "https://twitter.com/bazaarnova",
  socialInstagram: "https://instagram.com/bazaarnova"
};
var INITIAL_USERS = [
  {
    id: "user-admin-1",
    email: "admin@bazaarnova.com",
    name: "Eleanor Vance (Admin)",
    phone: "+1 (415) 890-1200",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "ADMIN",
    isSuspended: false,
    createdAt: "2025-01-10T08:00:00.000Z"
  },
  {
    id: "user-cust-1",
    email: "alex.morgan@example.com",
    name: "Alex Morgan",
    phone: "+1 (415) 555-0192",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    role: "CUSTOMER",
    isSuspended: false,
    createdAt: "2025-01-15T10:30:00.000Z"
  },
  {
    id: "user-cust-2",
    email: "sarah.chen@example.com",
    name: "Sarah Chen",
    phone: "+1 (212) 555-0144",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "CUSTOMER",
    isSuspended: false,
    createdAt: "2025-02-01T14:20:00.000Z"
  },
  {
    id: "user-cust-3",
    email: "marcus.brooks@example.com",
    name: "Marcus Brooks",
    phone: "+1 (312) 555-0177",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "CUSTOMER",
    isSuspended: false,
    createdAt: "2025-02-12T09:15:00.000Z"
  }
];
var INITIAL_ADDRESSES = [
  {
    id: "addr-1",
    userId: "user-cust-1",
    title: "Home",
    fullName: "Alex Morgan",
    phone: "+1 (415) 555-0192",
    street: "742 Evergreen Terrace, Apt 4B",
    city: "San Francisco",
    state: "CA",
    postalCode: "94110",
    country: "United States",
    isDefault: true
  },
  {
    id: "addr-2",
    userId: "user-cust-1",
    title: "Office",
    fullName: "Alex Morgan",
    phone: "+1 (415) 555-0192",
    street: "100 Market Street, 14th Floor",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "United States",
    isDefault: false
  },
  {
    id: "addr-3",
    userId: "user-cust-2",
    title: "Home",
    fullName: "Sarah Chen",
    phone: "+1 (212) 555-0144",
    street: "350 5th Avenue, Suite 210",
    city: "New York",
    state: "NY",
    postalCode: "10118",
    country: "United States",
    isDefault: true
  }
];
var INITIAL_CATEGORIES = [
  {
    id: "cat-mobiles",
    name: "Mobile Phones",
    slug: "mobile-phones",
    description: "Flagship smartphones, 5G devices & rugged phones",
    icon: "Smartphone",
    bannerImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    featured: true,
    productCount: 4
  },
  {
    id: "cat-laptops",
    name: "Laptops & Computers",
    slug: "laptops-computers",
    description: "High-performance ultra-books, gaming rigs & MacBooks",
    icon: "Laptop",
    bannerImage: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
    featured: true,
    productCount: 3
  },
  {
    id: "cat-electronics",
    name: "Electronics & Audio",
    slug: "electronics-audio",
    description: "Noise-canceling headphones, 4K TVs, smart wearables",
    icon: "Headphones",
    bannerImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    featured: true,
    productCount: 4
  },
  {
    id: "cat-fashion",
    name: "Fashion & Apparel",
    slug: "fashion-apparel",
    description: "Trending street fashion, footwear, premium jackets",
    icon: "Shirt",
    bannerImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80",
    featured: true,
    productCount: 4
  },
  {
    id: "cat-accessories",
    name: "Accessories & Watches",
    slug: "accessories-watches",
    description: "Luxury chronograph watches, sunglasses, EDC gear",
    icon: "Watch",
    bannerImage: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
    featured: true,
    productCount: 3
  },
  {
    id: "cat-home",
    name: "Home & Living",
    slug: "home-living",
    description: "Smart kitchen gadgets, ergonomic furniture, minimalist lamps",
    icon: "Home",
    bannerImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    featured: true,
    productCount: 3
  },
  {
    id: "cat-beauty",
    name: "Beauty & Skincare",
    slug: "beauty-skincare",
    description: "Hydrating serums, organic cosmetic sets, luxury perfumes",
    icon: "Sparkles",
    bannerImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
    featured: true,
    productCount: 2
  },
  {
    id: "cat-grocery",
    name: "Gourmet & Grocery",
    slug: "gourmet-grocery",
    description: "Artisanal coffee beans, organic matcha, superfood packs",
    icon: "ShoppingBag",
    bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80",
    featured: false,
    productCount: 2
  }
];
var INITIAL_PRODUCTS = [
  // 1. Mobile
  {
    id: "prod-1",
    name: "Nova Ultra 5G Pro Smartphone (256GB, Titanium Grey)",
    slug: "nova-ultra-5g-pro-smartphone",
    sku: "NOV-PHN-001",
    description: 'Experience pure speed with the flagship Nova Ultra 5G Pro. Featuring a stunning 6.8" 120Hz LTPO Dynamic AMOLED display, 200MP quadruple-sensor camera system with AI night photography, ultra-fast 100W HyperCharge, and a titanium alloy frame built for endurance.',
    price: 999,
    discount: 15,
    quantity: 45,
    stockStatus: "IN_STOCK",
    brand: "NovaTech",
    thumbnail: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    isFlashSale: true,
    flashSalePrice: 849,
    specifications: {
      "Display": "6.8-inch Dynamic AMOLED 2X, 120Hz",
      "Processor": "Snapdragon 8 Gen 3 (4nm)",
      "Camera": "200MP Wide + 50MP Periscope + 12MP Ultra-wide",
      "Battery": "5,000 mAh with 100W Fast Charging",
      "Operating System": "NovaOS 15 (Android 15 Base)",
      "Water Resistance": "IP68 certified"
    },
    rating: 4.8,
    reviewCount: 142,
    soldCount: 320,
    isArchived: false,
    categoryId: "cat-mobiles",
    createdAt: "2025-01-05T12:00:00.000Z"
  },
  // 2. Mobile
  {
    id: "prod-2",
    name: "Aero Fold 2 Dual-Screen Folding Phone (512GB)",
    slug: "aero-fold-2-dual-screen",
    sku: "AER-FLD-002",
    description: "Transform your mobile productivity with the revolutionary Aero Fold 2. Dual foldable OLED screens deliver seamless multitasking, zero-gap hinge engineering, and 12-hour active battery life.",
    price: 1399,
    discount: 10,
    quantity: 18,
    stockStatus: "IN_STOCK",
    brand: "AeroTech",
    thumbnail: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    isFlashSale: false,
    specifications: {
      "Main Screen": "7.9-inch Foldable OLED (2156x2340)",
      "Cover Screen": "6.4-inch OLED (1080x2400)",
      "Memory": "16GB RAM + 512GB UFS 4.0",
      "Weight": "239 grams"
    },
    rating: 4.7,
    reviewCount: 68,
    soldCount: 110,
    isArchived: false,
    categoryId: "cat-mobiles",
    createdAt: "2025-01-10T15:00:00.000Z"
  },
  // 3. Laptop
  {
    id: "prod-3",
    name: "ZenithBlade 16 Gaming Laptop (RTX 4080, 32GB RAM, 1TB SSD)",
    slug: "zenithblade-16-gaming-laptop",
    sku: "ZEN-LAP-003",
    description: "Uncompromising powerhouse for extreme gaming and 3D rendering. Powered by Intel Core i9-14900HX, NVIDIA GeForce RTX 4080 with 175W max TGP, and a QHD+ 240Hz 100% DCI-P3 color calibrated display with liquid metal vapor chamber cooling.",
    price: 2199,
    discount: 18,
    quantity: 12,
    stockStatus: "IN_STOCK",
    brand: "ZenithBlade",
    thumbnail: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    isFlashSale: true,
    flashSalePrice: 1799,
    specifications: {
      "Processor": "Intel Core i9-14900HX 24-core",
      "GPU": "NVIDIA GeForce RTX 4080 12GB GDDR6",
      "RAM": "32GB DDR5 5600MHz",
      "Storage": "1TB NVMe PCIe 4.0 SSD",
      "Display": '16.0" QHD+ (2560x1600) 240Hz 3ms',
      "Keyboard": "Per-key RGB Mechanical Optical Switch"
    },
    rating: 4.9,
    reviewCount: 94,
    soldCount: 180,
    isArchived: false,
    categoryId: "cat-laptops",
    createdAt: "2025-01-14T09:00:00.000Z"
  },
  // 4. Laptop
  {
    id: "prod-4",
    name: "AuraBook Air 14 Ultralight Laptop (M-Series, 18hr Battery)",
    slug: "aurabook-air-14-ultralight",
    sku: "AUR-LAP-004",
    description: "Featherlight CNC aluminum chassis weighing only 1.1kg. High-res 3K Retina display, fanless silent operation, studio-grade quad microphones, and a full-day battery lasting up to 18 hours.",
    price: 1149,
    discount: 5,
    quantity: 30,
    stockStatus: "IN_STOCK",
    brand: "Aura",
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    isFlashSale: false,
    specifications: {
      "Display": '14.2" Liquid Retina XDR (3024x1964)',
      "Memory": "16GB Unified Architecture",
      "Storage": "512GB Fast NVMe",
      "Weight": "1.14 kg (2.5 lbs)"
    },
    rating: 4.8,
    reviewCount: 118,
    soldCount: 420,
    isArchived: false,
    categoryId: "cat-laptops",
    createdAt: "2025-01-18T11:00:00.000Z"
  },
  // 5. Electronics & Audio
  {
    id: "prod-5",
    name: "SonicAura Studio Wireless ANC Headphones (Spatial Audio)",
    slug: "sonicaura-studio-wireless-anc-headphones",
    sku: "SON-AUD-005",
    description: "Immerse in studio acoustics with custom 45mm beryllium drivers, active adaptive hybrid noise cancellation (42dB reduction), LDAC high-resolution codec, and plush memory foam protein ear cups.",
    price: 299,
    discount: 25,
    quantity: 60,
    stockStatus: "IN_STOCK",
    brand: "SonicAura",
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    isFlashSale: true,
    flashSalePrice: 224,
    specifications: {
      "Driver Size": "45mm Custom Beryllium",
      "Battery Life": "50 hours (ANC Off) / 38 hours (ANC On)",
      "Connectivity": "Bluetooth 5.3 + 3.5mm Aux + USB-C DAC",
      "Noise Cancellation": "Hybrid Active Noise Cancellation"
    },
    rating: 4.9,
    reviewCount: 312,
    soldCount: 890,
    isArchived: false,
    categoryId: "cat-electronics",
    createdAt: "2025-01-02T16:00:00.000Z"
  },
  // 6. Electronics & Audio
  {
    id: "prod-6",
    name: "PulseBass 360 Waterproof Portable Bluetooth Speaker",
    slug: "pulsebass-360-waterproof-speaker",
    sku: "PUL-SPK-006",
    description: "Rugged, IPX7 waterproof cylindrical speaker with dual passive radiators, 360-degree room-filling sound, interactive beat-synced RGB LED light show, and 24-hour party playback.",
    price: 119,
    discount: 20,
    quantity: 85,
    stockStatus: "IN_STOCK",
    brand: "PulseAudio",
    thumbnail: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    isFlashSale: false,
    specifications: {
      "Output Power": "40W RMS",
      "Waterproof": "IPX7 certified",
      "Battery Life": "24 hours continuous",
      "Weight": "780g"
    },
    rating: 4.6,
    reviewCount: 154,
    soldCount: 520,
    isArchived: false,
    categoryId: "cat-electronics",
    createdAt: "2025-01-22T14:00:00.000Z"
  },
  // 7. Fashion
  {
    id: "prod-7",
    name: "UrbanTech All-Weather Windbreaker Bomber Jacket",
    slug: "urbantech-all-weather-windbreaker-bomber",
    sku: "URB-JAC-007",
    description: "Engineered for modern urban commute. Crafted with breathable Gore-Tex DWR shell, thermal reflective inner lining, waterproof YKK taped zippers, and hidden internal security pockets.",
    price: 149,
    discount: 30,
    quantity: 40,
    stockStatus: "IN_STOCK",
    brand: "UrbanCraft",
    thumbnail: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    isFlashSale: true,
    flashSalePrice: 104,
    specifications: {
      "Material": "100% Recycled Hydro-Nylon + DWR",
      "Fit": "Athletic Slim Fit",
      "Care": "Machine wash cold, gentle cycle",
      "Features": "Reflective accents, storm hood"
    },
    rating: 4.7,
    reviewCount: 88,
    soldCount: 310,
    isArchived: false,
    categoryId: "cat-fashion",
    createdAt: "2025-01-08T10:00:00.000Z"
  },
  // 8. Fashion
  {
    id: "prod-8",
    name: "AeroCushion CloudStride Breathable Running Sneakers",
    slug: "aerocushion-cloudstride-running-sneakers",
    sku: "AER-SNK-008",
    description: "Designed for runners seeking responsive bounce. Features nitrogen-infused EVA midsole, seamless engineered knit mesh upper, carbon-plate energy return, and anti-slip rubber outsole.",
    price: 129,
    discount: 15,
    quantity: 55,
    stockStatus: "IN_STOCK",
    brand: "StrideFit",
    thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    isFlashSale: false,
    specifications: {
      "Upper": "Engineered Jacquard Knit Mesh",
      "Midsole": "Nitrogen-Infused Foam + Carbon Shank",
      "Weight": "210g (Size 9)",
      "Drop": "8mm offset"
    },
    rating: 4.8,
    reviewCount: 220,
    soldCount: 760,
    isArchived: false,
    categoryId: "cat-fashion",
    createdAt: "2025-01-16T13:00:00.000Z"
  },
  // 9. Accessories & Watches
  {
    id: "prod-9",
    name: "Vanguard Chronograph Sapphire Automatic Watch",
    slug: "vanguard-chronograph-sapphire-watch",
    sku: "VAN-WTC-009",
    description: "Timeless luxury meets precision horology. 316L surgical-grade stainless steel case, anti-reflective domed sapphire crystal, Swiss automatic 28-jewel movement, and genuine Italian full-grain leather strap.",
    price: 489,
    discount: 22,
    quantity: 24,
    stockStatus: "IN_STOCK",
    brand: "Vanguard Horology",
    thumbnail: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    isFlashSale: true,
    flashSalePrice: 380,
    specifications: {
      "Movement": "Automatic Calibre 4R36 (41hr reserve)",
      "Case Diameter": "42mm",
      "Glass": "Anti-Reflective Double Curved Sapphire",
      "Water Resistance": "100m (10 ATM)"
    },
    rating: 4.9,
    reviewCount: 75,
    soldCount: 140,
    isArchived: false,
    categoryId: "cat-accessories",
    createdAt: "2025-01-20T17:00:00.000Z"
  },
  // 10. Home & Living
  {
    id: "prod-10",
    name: "AeroBrew Barista Espresso Machine with Steam Wand",
    slug: "aerobrew-barista-espresso-machine",
    sku: "AER-ESP-010",
    description: "Craft caf\xE9-quality third wave specialty coffee at home. 20-bar Italian electromagnetic pump, PID precision temperature control, integrated 30-step conical burr grinder, and commercial micro-foam steam wand.",
    price: 349,
    discount: 15,
    quantity: 15,
    stockStatus: "IN_STOCK",
    brand: "BaristaCraft",
    thumbnail: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    isFlashSale: false,
    specifications: {
      "Pump Pressure": "20 Bar Italian Pump",
      "Water Tank": "2.2 Liters Detachable",
      "Grinder": "30 Grind Settings Stainless Steel Conical",
      "Power": "1450W Fast Thermoblock"
    },
    rating: 4.7,
    reviewCount: 120,
    soldCount: 290,
    isArchived: false,
    categoryId: "cat-home",
    createdAt: "2025-01-12T08:00:00.000Z"
  },
  // 11. Beauty & Skincare
  {
    id: "prod-11",
    name: "LumiHydra Hyaluronic & Peptide Radiance Face Serum (50ml)",
    slug: "lumihydra-peptide-radiance-serum",
    sku: "LUM-SER-011",
    description: "Intense clinical hydration formula packed with 5 molecular weights of pure hyaluronic acid, multi-peptides, niacinamide, and organic botanical extracts to plump skin, restore radiance, and smooth fine lines.",
    price: 42,
    discount: 10,
    quantity: 90,
    stockStatus: "IN_STOCK",
    brand: "Lumi\xE8re Botanicals",
    thumbnail: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608248597359-54845517178a?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    isFlashSale: false,
    specifications: {
      "Volume": "50ml (1.7 fl. oz.)",
      "Skin Type": "All Skin Types (Sensitive Safe)",
      "Cruelty Free": "100% Vegan & Leaping Bunny Certified",
      "Origin": "Made in France"
    },
    rating: 4.9,
    reviewCount: 280,
    soldCount: 1150,
    isArchived: false,
    categoryId: "cat-beauty",
    createdAt: "2025-01-07T14:00:00.000Z"
  },
  // 12. Gourmet Grocery
  {
    id: "prod-12",
    name: "Artisanal Single-Origin Ethiopian Yirgacheffe Whole Coffee Beans (1kg)",
    slug: "ethiopian-yirgacheffe-whole-coffee-beans",
    sku: "ETH-COF-012",
    description: "Freshly roasted specialty Grade 1 Arabica whole beans. Notes of wild bergamot, sweet jasmine, and juicy Meyer lemon with a clean floral honey finish.",
    price: 34,
    discount: 12,
    quantity: 65,
    stockStatus: "IN_STOCK",
    brand: "RoastMasters Guild",
    thumbnail: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    isFlashSale: false,
    specifications: {
      "Roast Level": "Medium Light Roast",
      "Process": "Washed & Sun-Dried",
      "Altitude": "1,900 - 2,200 MASL",
      "Weight": "1.0 kg (2.2 lbs) Nitrogen-Flushed Bag"
    },
    rating: 4.8,
    reviewCount: 165,
    soldCount: 680,
    isArchived: false,
    categoryId: "cat-grocery",
    createdAt: "2025-01-15T08:00:00.000Z"
  }
];
var INITIAL_BANNERS = [
  {
    id: "ban-1",
    title: "Grand Tech Carnival 2025",
    subtitle: "Up to 50% Off on Flagship Phones, Gaming Laptops & Hi-Fi Audio",
    badge: "LIMITED TIME ONLY",
    linkUrl: "/catalog?category=electronics-audio",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80",
    type: "HERO_SLIDER",
    order: 1,
    isActive: true,
    bgColor: "#1e1b4b",
    accentColor: "#f97316"
  },
  {
    id: "ban-2",
    title: "Spring Fashion Week Drops",
    subtitle: "Elevate your wardrobe with breathable fabrics & urban aesthetics",
    badge: "NEW ARRIVALS",
    linkUrl: "/catalog?category=fashion-apparel",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&auto=format&fit=crop&q=80",
    type: "HERO_SLIDER",
    order: 2,
    isActive: true,
    bgColor: "#18181b",
    accentColor: "#38bdf8"
  },
  {
    id: "ban-3",
    title: "Smart Home & Gourmet Living",
    subtitle: "Transform your kitchen with premium barista gear & smart devices",
    badge: "EXCLUSIVE DEALS",
    linkUrl: "/catalog?category=home-living",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1400&auto=format&fit=crop&q=80",
    type: "HERO_SLIDER",
    order: 3,
    isActive: true,
    bgColor: "#064e3b",
    accentColor: "#34d399"
  },
  {
    id: "ban-promo-1",
    title: "Flash Hour Deals",
    subtitle: "Extra 20% off with coupon code FLASH25",
    linkUrl: "/catalog?flashSale=true",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80",
    type: "PROMOTIONAL",
    order: 1,
    isActive: true,
    bgColor: "#dc2626"
  },
  {
    id: "ban-promo-2",
    title: "Free Express Shipping",
    subtitle: "On all orders above $50 with guaranteed 2-day delivery",
    linkUrl: "/catalog",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    type: "PROMOTIONAL",
    order: 2,
    isActive: true,
    bgColor: "#2563eb"
  }
];
var INITIAL_COUPONS = [
  {
    id: "coup-1",
    code: "WELCOME10",
    discountType: "PERCENTAGE",
    value: 10,
    minSpend: 30,
    maxDiscount: 50,
    expiryDate: "2026-12-31T23:59:59.000Z",
    usageLimit: 1e3,
    timesUsed: 142,
    isActive: true
  },
  {
    id: "coup-2",
    code: "FLASH25",
    discountType: "PERCENTAGE",
    value: 25,
    minSpend: 100,
    maxDiscount: 100,
    expiryDate: "2026-12-31T23:59:59.000Z",
    usageLimit: 500,
    timesUsed: 89,
    isActive: true
  },
  {
    id: "coup-3",
    code: "SUPER50",
    discountType: "FIXED",
    value: 50,
    minSpend: 250,
    expiryDate: "2026-12-31T23:59:59.000Z",
    usageLimit: 200,
    timesUsed: 44,
    isActive: true
  },
  {
    id: "coup-4",
    code: "SAVE15",
    discountType: "PERCENTAGE",
    value: 15,
    minSpend: 75,
    maxDiscount: 75,
    expiryDate: "2026-12-31T23:59:59.000Z",
    usageLimit: 800,
    timesUsed: 210,
    isActive: true
  }
];
var INITIAL_REVIEWS = [
  {
    id: "rev-1",
    userId: "user-cust-1",
    userName: "Alex Morgan",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    productId: "prod-1",
    productName: "Nova Ultra 5G Pro Smartphone",
    rating: 5,
    title: "Phenomenal Camera & Super Fast 100W Charging",
    comment: "The 200MP camera is beyond impressive in low light. The battery lasts well over a day and a half with heavy usage, and 100W charging gets it from 5% to 100% in under 28 minutes. Best phone I have owned!",
    status: "APPROVED",
    verifiedPurchase: true,
    createdAt: "2025-01-20T14:32:00.000Z"
  },
  {
    id: "rev-2",
    userId: "user-cust-2",
    userName: "Sarah Chen",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    productId: "prod-5",
    productName: "SonicAura Studio Wireless ANC Headphones",
    rating: 5,
    title: "Absolute Audio Heaven!",
    comment: "The noise cancellation completely blacks out subway noise and airplane drone. The beryllium drivers deliver deep, tight sub-bass without muddying vocals. Super comfy ear pads too.",
    status: "APPROVED",
    verifiedPurchase: true,
    createdAt: "2025-01-24T18:10:00.000Z"
  },
  {
    id: "rev-3",
    userId: "user-cust-3",
    userName: "Marcus Brooks",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    productId: "prod-3",
    productName: "ZenithBlade 16 Gaming Laptop",
    rating: 5,
    title: "Beast of a gaming machine",
    comment: "Cyberpunk 2077 with ray tracing on runs at solid 100+ FPS in native 1600p. Cooling is loud under load as expected, but thermal throttling is zero.",
    status: "APPROVED",
    verifiedPurchase: true,
    createdAt: "2025-02-02T11:05:00.000Z"
  }
];
var INITIAL_ORDERS = [
  {
    id: "ord-1001",
    orderNumber: "BN-849201",
    userId: "user-cust-1",
    user: {
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      phone: "+1 (415) 555-0192"
    },
    address: INITIAL_ADDRESSES[0],
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Nova Ultra 5G Pro Smartphone (256GB, Titanium Grey)",
        productImage: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80",
        productSku: "NOV-PHN-001",
        price: 849,
        quantity: 1,
        discount: 15,
        total: 849
      },
      {
        id: "item-2",
        productId: "prod-5",
        productName: "SonicAura Studio Wireless ANC Headphones",
        productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        productSku: "SON-AUD-005",
        price: 224,
        quantity: 1,
        discount: 25,
        total: 224
      }
    ],
    subtotal: 1073,
    shippingFee: 0,
    // Free shipping above $50
    discount: 50,
    // SUPER50 coupon
    tax: 76.72,
    totalAmount: 1099.72,
    status: "DELIVERED",
    paymentMethod: "PAYPAL",
    paymentStatus: "PAID",
    trackingCode: "TRK-98427192US",
    customerNotes: "Please ring bell and leave by the front door.",
    couponCode: "SUPER50",
    timeline: [
      {
        status: "PENDING",
        timestamp: "2025-01-20T10:00:00.000Z",
        title: "Order Placed",
        description: "Payment authorized via PayPal.",
        completed: true
      },
      {
        status: "CONFIRMED",
        timestamp: "2025-01-20T10:15:00.000Z",
        title: "Order Confirmed",
        description: "Order details verified by seller.",
        completed: true
      },
      {
        status: "PROCESSING",
        timestamp: "2025-01-20T14:30:00.000Z",
        title: "Processing in Warehouse",
        description: "Items picked from inventory batch.",
        completed: true
      },
      {
        status: "PACKED",
        timestamp: "2025-01-21T08:00:00.000Z",
        title: "Packed & Labeled",
        description: "Package boxed with eco-friendly protective padding.",
        completed: true
      },
      {
        status: "SHIPPED",
        timestamp: "2025-01-21T16:00:00.000Z",
        title: "Shipped with Carrier",
        description: "In transit via FedEx Express (TRK-98427192US).",
        completed: true
      },
      {
        status: "OUT_FOR_DELIVERY",
        timestamp: "2025-01-23T08:30:00.000Z",
        title: "Out for Delivery",
        description: "Courier is delivering your package today.",
        completed: true
      },
      {
        status: "DELIVERED",
        timestamp: "2025-01-23T13:45:00.000Z",
        title: "Delivered",
        description: "Package successfully received at door.",
        completed: true
      }
    ],
    createdAt: "2025-01-20T10:00:00.000Z",
    updatedAt: "2025-01-23T13:45:00.000Z"
  },
  {
    id: "ord-1002",
    orderNumber: "BN-849305",
    userId: "user-cust-2",
    user: {
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      phone: "+1 (212) 555-0144"
    },
    address: INITIAL_ADDRESSES[2],
    items: [
      {
        id: "item-3",
        productId: "prod-7",
        productName: "UrbanTech All-Weather Windbreaker Bomber Jacket",
        productImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
        productSku: "URB-JAC-007",
        price: 104,
        quantity: 1,
        discount: 30,
        total: 104
      }
    ],
    subtotal: 104,
    shippingFee: 0,
    discount: 10.4,
    tax: 7.02,
    totalAmount: 100.62,
    status: "SHIPPED",
    paymentMethod: "PAYONEER",
    paymentStatus: "PAID",
    trackingCode: "TRK-77189021US",
    customerNotes: "",
    couponCode: "WELCOME10",
    timeline: [
      {
        status: "PENDING",
        timestamp: "2025-02-05T09:00:00.000Z",
        title: "Order Placed",
        description: "Payment authorized via Payoneer.",
        completed: true
      },
      {
        status: "CONFIRMED",
        timestamp: "2025-02-05T09:20:00.000Z",
        title: "Order Confirmed",
        description: "Order confirmed and scheduled for dispatch.",
        completed: true
      },
      {
        status: "PROCESSING",
        timestamp: "2025-02-05T13:00:00.000Z",
        title: "Processing",
        description: "Item QA inspected.",
        completed: true
      },
      {
        status: "PACKED",
        timestamp: "2025-02-06T08:00:00.000Z",
        title: "Packed",
        description: "Sealed in tamper-evident packaging.",
        completed: true
      },
      {
        status: "SHIPPED",
        timestamp: "2025-02-06T15:30:00.000Z",
        title: "Shipped",
        description: "Handed off to DHL Express.",
        completed: true
      }
    ],
    createdAt: "2025-02-05T09:00:00.000Z",
    updatedAt: "2025-02-06T15:30:00.000Z"
  },
  {
    id: "ord-1003",
    orderNumber: "BN-849410",
    userId: "user-cust-1",
    user: {
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      phone: "+1 (415) 555-0192"
    },
    address: INITIAL_ADDRESSES[0],
    items: [
      {
        id: "item-4",
        productId: "prod-10",
        productName: "AeroBrew Barista Espresso Machine with Steam Wand",
        productImage: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
        productSku: "AER-ESP-010",
        price: 349,
        quantity: 1,
        discount: 15,
        total: 349
      }
    ],
    subtotal: 349,
    shippingFee: 0,
    discount: 0,
    tax: 26.17,
    totalAmount: 375.17,
    status: "PROCESSING",
    paymentMethod: "CREDIT_CARD",
    paymentStatus: "PAID",
    trackingCode: "TRK-PENDING",
    customerNotes: "Fragile equipment",
    timeline: [
      {
        status: "PENDING",
        timestamp: "2025-02-14T11:20:00.000Z",
        title: "Order Placed",
        description: "Order placed with Visa ending in 4242.",
        completed: true
      },
      {
        status: "CONFIRMED",
        timestamp: "2025-02-14T11:45:00.000Z",
        title: "Order Confirmed",
        description: "Inventory allocated.",
        completed: true
      },
      {
        status: "PROCESSING",
        timestamp: "2025-02-14T14:00:00.000Z",
        title: "Processing",
        description: "Preparing for courier dispatch.",
        completed: true
      }
    ],
    createdAt: "2025-02-14T11:20:00.000Z",
    updatedAt: "2025-02-14T14:00:00.000Z"
  }
];
var INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    userId: null,
    // Global
    title: "\u{1F680} Grand Weekend Flash Sale is LIVE!",
    message: "Enjoy up to 50% discount on electronics, audio, and gaming gear. Use code FLASH25 for extra savings.",
    type: "PROMOTIONAL",
    isRead: false,
    linkUrl: "/catalog?flashSale=true",
    createdAt: "2025-02-14T08:00:00.000Z"
  },
  {
    id: "notif-2",
    userId: "user-cust-1",
    title: "\u{1F4E6} Order #BN-849201 Delivered",
    message: "Your package containing Nova Ultra 5G Pro Smartphone has been delivered to your front door.",
    type: "ORDER",
    isRead: true,
    linkUrl: "/orders/ord-1001",
    createdAt: "2025-01-23T13:45:00.000Z"
  },
  {
    id: "notif-3",
    userId: "user-cust-1",
    title: "\u{1F389} 15% VIP Customer Discount Coupon",
    message: "We appreciate your loyalty! Use coupon code SAVE15 on your next checkout.",
    type: "DISCOUNT",
    isRead: false,
    linkUrl: "/catalog",
    createdAt: "2025-02-10T12:00:00.000Z"
  }
];

// src/server/db/store.ts
import fs from "fs";
import path from "path";
var DB_FILE = path.resolve(process.cwd(), "db_storage.json");
var DataStore = class {
  constructor() {
    this.products = [...INITIAL_PRODUCTS];
    this.categories = [...INITIAL_CATEGORIES];
    this.orders = [...INITIAL_ORDERS];
    this.users = [...INITIAL_USERS];
    this.addresses = [...INITIAL_ADDRESSES];
    this.coupons = [...INITIAL_COUPONS];
    this.banners = [...INITIAL_BANNERS];
    this.reviews = [...INITIAL_REVIEWS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.settings = { ...INITIAL_SETTINGS };
    this.userCarts = /* @__PURE__ */ new Map();
    this.userWishlists = /* @__PURE__ */ new Map();
    this.loadFromDisk();
    this.userCarts.set("user-cust-1", [
      {
        id: "cart-init-1",
        productId: "prod-8",
        product: this.products.find((p) => p.id === "prod-8") || this.products[0],
        quantity: 1
      }
    ]);
    this.userWishlists.set("user-cust-1", [
      {
        id: "wish-init-1",
        productId: "prod-9",
        product: this.products.find((p) => p.id === "prod-9") || this.products[0],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]);
    this.updateCategoryProductCounts();
  }
  saveToDisk() {
    try {
      const data = {
        products: this.products,
        categories: this.categories,
        orders: this.orders,
        users: this.users,
        coupons: this.coupons,
        banners: this.banners,
        reviews: this.reviews,
        settings: this.settings,
        notifications: this.notifications
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save DB to disk:", err);
    }
  }
  loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const data = JSON.parse(raw);
        if (data.products && Array.isArray(data.products)) this.products = data.products;
        if (data.categories && Array.isArray(data.categories)) this.categories = data.categories;
        if (data.orders && Array.isArray(data.orders)) this.orders = data.orders;
        if (data.users && Array.isArray(data.users)) this.users = data.users;
        if (data.coupons && Array.isArray(data.coupons)) this.coupons = data.coupons;
        if (data.banners && Array.isArray(data.banners)) this.banners = data.banners;
        if (data.reviews && Array.isArray(data.reviews)) this.reviews = data.reviews;
        if (data.settings) this.settings = data.settings;
        if (data.notifications && Array.isArray(data.notifications)) this.notifications = data.notifications;
      }
    } catch (err) {
      console.error("Failed to load DB from disk:", err);
    }
  }
  // --- PRODUCTS ---
  getProducts(params) {
    let filtered = [...this.products].filter((p) => !p.isArchived);
    const allBrands = Array.from(new Set(this.products.map((p) => p.brand))).sort();
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    if (params?.category && params.category !== "all") {
      const cat = this.categories.find((c) => c.slug === params.category || c.id === params.category);
      if (cat) {
        filtered = filtered.filter((p) => p.categoryId === cat.id);
      }
    }
    if (params?.brand && params.brand !== "all") {
      filtered = filtered.filter((p) => p.brand.toLowerCase() === params.brand?.toLowerCase());
    }
    if (params?.minPrice !== void 0) {
      filtered = filtered.filter((p) => {
        const effectivePrice = p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price * (1 - p.discount / 100);
        return effectivePrice >= (params.minPrice ?? 0);
      });
    }
    if (params?.maxPrice !== void 0 && params.maxPrice > 0) {
      filtered = filtered.filter((p) => {
        const effectivePrice = p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price * (1 - p.discount / 100);
        return effectivePrice <= (params.maxPrice ?? Infinity);
      });
    }
    if (params?.minRating !== void 0 && params.minRating > 0) {
      filtered = filtered.filter((p) => p.rating >= (params.minRating ?? 0));
    }
    if (params?.inStockOnly) {
      filtered = filtered.filter((p) => p.quantity > 0 && p.stockStatus === "IN_STOCK");
    }
    if (params?.onSaleOnly) {
      filtered = filtered.filter((p) => p.discount > 0 || p.isFlashSale);
    }
    if (params?.flashSaleOnly) {
      filtered = filtered.filter((p) => p.isFlashSale);
    }
    switch (params?.sortBy) {
      case "price_asc":
        filtered.sort((a, b) => {
          const priceA = a.isFlashSale && a.flashSalePrice ? a.flashSalePrice : a.price * (1 - a.discount / 100);
          const priceB = b.isFlashSale && b.flashSalePrice ? b.flashSalePrice : b.price * (1 - b.discount / 100);
          return priceA - priceB;
        });
        break;
      case "price_desc":
        filtered.sort((a, b) => {
          const priceA = a.isFlashSale && a.flashSalePrice ? a.flashSalePrice : a.price * (1 - a.discount / 100);
          const priceB = b.isFlashSale && b.flashSalePrice ? b.flashSalePrice : b.price * (1 - b.discount / 100);
          return priceB - priceA;
        });
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "popular":
      default:
        filtered.sort((a, b) => b.soldCount - a.soldCount || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    const total = filtered.length;
    const page = params?.page || 1;
    const limit = params?.limit || 100;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    const populated = paginated.map((p) => ({
      ...p,
      category: this.categories.find((c) => c.id === p.categoryId)
    }));
    return { products: populated, total, brands: allBrands };
  }
  getProductById(idOrSlug) {
    const product = this.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (!product) return null;
    return {
      ...product,
      category: this.categories.find((c) => c.id === product.categoryId)
    };
  }
  createProduct(data) {
    const id = `prod-${Date.now()}`;
    const slug = (data.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const newProduct = {
      id,
      name: data.name || "Untitled Product",
      slug: data.slug || `${slug}-${Math.floor(Math.random() * 1e3)}`,
      sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
      description: data.description || "",
      price: Number(data.price) || 0,
      discount: Number(data.discount) || 0,
      quantity: Number(data.quantity) || 0,
      stockStatus: data.quantity && data.quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      brand: data.brand || "Generic",
      thumbnail: data.thumbnail || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      images: data.images && data.images.length > 0 ? data.images : [data.thumbnail || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"],
      featured: Boolean(data.featured),
      isFlashSale: Boolean(data.isFlashSale),
      flashSalePrice: data.flashSalePrice ? Number(data.flashSalePrice) : void 0,
      specifications: data.specifications || {},
      rating: 5,
      reviewCount: 0,
      soldCount: 0,
      isArchived: false,
      categoryId: data.categoryId || this.categories[0]?.id || "cat-mobiles",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const createdWithCategory = {
      ...newProduct,
      category: this.categories.find((c) => c.id === newProduct.categoryId)
    };
    this.products.unshift(newProduct);
    this.updateCategoryProductCounts();
    this.saveToDisk();
    return createdWithCategory;
  }
  updateProduct(id, data) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const existing = this.products[index];
    const updated = {
      ...existing,
      ...data,
      price: data.price !== void 0 ? Number(data.price) : existing.price,
      discount: data.discount !== void 0 ? Number(data.discount) : existing.discount,
      quantity: data.quantity !== void 0 ? Number(data.quantity) : existing.quantity,
      stockStatus: data.quantity !== void 0 ? Number(data.quantity) > 5 ? "IN_STOCK" : Number(data.quantity) > 0 ? "LOW_STOCK" : "OUT_OF_STOCK" : existing.stockStatus
    };
    this.products[index] = updated;
    this.updateCategoryProductCounts();
    this.saveToDisk();
    return updated;
  }
  deleteProduct(id) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    this.updateCategoryProductCounts();
    this.saveToDisk();
    return true;
  }
  toggleArchiveProduct(id) {
    const product = this.products.find((p) => p.id === id);
    if (!product) return null;
    product.isArchived = !product.isArchived;
    this.saveToDisk();
    return product;
  }
  // --- CATEGORIES ---
  getCategories() {
    this.updateCategoryProductCounts();
    return [...this.categories];
  }
  createCategory(data) {
    const id = `cat-${Date.now()}`;
    const slug = (data.name || "category").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const newCat = {
      id,
      name: data.name || "New Category",
      slug: data.slug || slug,
      description: data.description || "",
      icon: data.icon || "ShoppingBag",
      bannerImage: data.bannerImage || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
      featured: Boolean(data.featured),
      productCount: 0
    };
    this.categories.push(newCat);
    return newCat;
  }
  updateCategory(id, data) {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.categories[index] = { ...this.categories[index], ...data };
    return this.categories[index];
  }
  deleteCategory(id) {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.categories.splice(index, 1);
    return true;
  }
  updateCategoryProductCounts() {
    for (const cat of this.categories) {
      cat.productCount = this.products.filter((p) => p.categoryId === cat.id && !p.isArchived).length;
    }
  }
  // --- CART ---
  getCart(userId) {
    const items = this.userCarts.get(userId) || [];
    return items.map((item) => {
      const liveProduct = this.products.find((p) => p.id === item.productId) || item.product;
      return {
        ...item,
        product: liveProduct
      };
    });
  }
  addToCart(userId, productId, quantity = 1, variant) {
    const cart = this.getCart(userId);
    const product = this.products.find((p) => p.id === productId);
    if (!product) throw new Error("Product not found");
    const existingIndex = cart.findIndex((item) => item.productId === productId && item.selectedVariant === variant);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId,
        product,
        quantity,
        selectedVariant: variant
      });
    }
    this.userCarts.set(userId, cart);
    return this.getCart(userId);
  }
  updateCartItem(userId, itemId, quantity) {
    let cart = this.getCart(userId);
    if (quantity <= 0) {
      cart = cart.filter((item) => item.id !== itemId);
    } else {
      const item = cart.find((i) => i.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
    }
    this.userCarts.set(userId, cart);
    return this.getCart(userId);
  }
  removeCartItem(userId, itemId) {
    const cart = this.getCart(userId).filter((item) => item.id !== itemId);
    this.userCarts.set(userId, cart);
    return this.getCart(userId);
  }
  clearCart(userId) {
    this.userCarts.set(userId, []);
  }
  // --- WISHLIST ---
  getWishlist(userId) {
    const items = this.userWishlists.get(userId) || [];
    return items.map((item) => ({
      ...item,
      product: this.products.find((p) => p.id === item.productId) || item.product
    }));
  }
  toggleWishlist(userId, productId) {
    const list = this.getWishlist(userId);
    const existingIndex = list.findIndex((item) => item.productId === productId);
    let isAdded = false;
    if (existingIndex > -1) {
      list.splice(existingIndex, 1);
      isAdded = false;
    } else {
      const product = this.products.find((p) => p.id === productId);
      if (product) {
        list.push({
          id: `wish-${Date.now()}`,
          productId,
          product,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        isAdded = true;
      }
    }
    this.userWishlists.set(userId, list);
    return { wishlist: this.getWishlist(userId), isAdded };
  }
  // --- ORDERS ---
  getOrders(userId) {
    if (userId) {
      return this.orders.filter((o) => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getOrderById(id) {
    return this.orders.find((o) => o.id === id || o.orderNumber === id) || null;
  }
  createOrder(data) {
    const user = this.users.find((u) => u.id === data.userId);
    const orderNumber = `BN-${Math.floor(1e5 + Math.random() * 9e5)}`;
    let subtotal = 0;
    const orderItems = data.items.map((item) => {
      const prod = this.products.find((p) => p.id === item.productId);
      if (!prod) throw new Error(`Product ${item.productId} not found`);
      const price = prod.isFlashSale && prod.flashSalePrice ? prod.flashSalePrice : prod.price * (1 - prod.discount / 100);
      const total = price * item.quantity;
      subtotal += total;
      prod.soldCount += item.quantity;
      prod.quantity = Math.max(0, prod.quantity - item.quantity);
      if (prod.quantity === 0) prod.stockStatus = "OUT_OF_STOCK";
      else if (prod.quantity < 5) prod.stockStatus = "LOW_STOCK";
      return {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.thumbnail,
        productSku: prod.sku,
        price,
        quantity: item.quantity,
        discount: prod.discount,
        total
      };
    });
    let discount = 0;
    if (data.couponCode) {
      const coupon = this.coupons.find((c) => c.code.toUpperCase() === data.couponCode?.toUpperCase() && c.isActive);
      if (coupon && subtotal >= coupon.minSpend) {
        if (coupon.discountType === "PERCENTAGE") {
          discount = subtotal * coupon.value / 100;
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else {
          discount = Math.min(coupon.value, subtotal);
        }
        coupon.timesUsed += 1;
      }
    }
    const shippingFee = subtotal >= this.settings.freeShippingAbove ? 0 : this.settings.shippingCharge;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number((taxableAmount * this.settings.taxPercentage / 100).toFixed(2));
    const totalAmount = Number((taxableAmount + shippingFee + tax).toFixed(2));
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: data.userId,
      user: user ? { name: user.name, email: user.email, phone: user.phone } : void 0,
      address: data.address,
      items: orderItems,
      subtotal: Number(subtotal.toFixed(2)),
      shippingFee,
      discount: Number(discount.toFixed(2)),
      tax,
      totalAmount,
      status: "PENDING",
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "CASH_ON_DELIVERY" ? "PENDING" : "PAID",
      trackingCode: `TRK-${Math.floor(1e7 + Math.random() * 9e7)}US`,
      customerNotes: data.customerNotes,
      couponCode: data.couponCode,
      timeline: [
        {
          status: "PENDING",
          timestamp: now,
          title: "Order Placed",
          description: `Order successfully placed with ${data.paymentMethod.replace(/_/g, " ")}.`,
          completed: true
        }
      ],
      createdAt: now,
      updatedAt: now
    };
    this.orders.unshift(newOrder);
    this.clearCart(data.userId);
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: data.userId,
      title: `\u{1F6CD}\uFE0F Order Placed (#${orderNumber})`,
      message: `Your order for ${orderItems.length} item(s) totaling $${totalAmount} has been confirmed.`,
      type: "ORDER",
      isRead: false,
      linkUrl: `/orders/${newOrder.id}`,
      createdAt: now
    });
    return newOrder;
  }
  updateOrderStatus(orderId, status) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const titles = {
      PENDING: { title: "Order Placed", desc: "Order received by the store." },
      CONFIRMED: { title: "Order Confirmed", desc: "Seller verified items and stock." },
      PROCESSING: { title: "Processing", desc: "Items in picking queue at warehouse." },
      PACKED: { title: "Packed & Labeled", desc: "Package boxed and sealed for courier handover." },
      SHIPPED: { title: "Shipped with Carrier", desc: `In transit with tracking #${order.trackingCode}.` },
      OUT_FOR_DELIVERY: { title: "Out for Delivery", desc: "Courier driver is on the delivery route." },
      DELIVERED: { title: "Delivered", desc: "Package was successfully delivered." },
      CANCELLED: { title: "Order Cancelled", desc: "Order was cancelled and inventory released." },
      REFUNDED: { title: "Refunded", desc: "Payment was refunded back to original method." }
    };
    const existing = order.timeline.find((t) => t.status === status);
    if (!existing) {
      order.timeline.push({
        status,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        title: titles[status].title,
        description: titles[status].desc,
        completed: true
      });
    }
    if (status === "DELIVERED") {
      order.paymentStatus = "PAID";
    }
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: order.userId,
      title: `\u{1F4E6} Order #${order.orderNumber} is now ${status.replace(/_/g, " ")}`,
      message: titles[status].desc,
      type: "ORDER",
      isRead: false,
      linkUrl: `/orders/${order.id}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    return order;
  }
  cancelOrder(orderId, userId, reason) {
    const order = this.orders.find((o) => o.id === orderId && (o.userId === userId || userId === "admin"));
    if (!order) return null;
    if (["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status)) {
      throw new Error("Cannot cancel an order that is already shipped or delivered");
    }
    return this.updateOrderStatus(orderId, "CANCELLED");
  }
  // --- REVIEWS ---
  getReviews(productId) {
    if (productId) {
      return this.reviews.filter((r) => r.productId === productId && r.status === "APPROVED");
    }
    return [...this.reviews];
  }
  createReview(data) {
    const user = this.users.find((u) => u.id === data.userId);
    const product = this.products.find((p) => p.id === data.productId);
    if (!product) throw new Error("Product not found");
    const newReview = {
      id: `rev-${Date.now()}`,
      userId: data.userId,
      userName: user ? user.name : "Verified Customer",
      userAvatar: user?.avatar,
      productId: data.productId,
      productName: product.name,
      rating: Math.min(5, Math.max(1, data.rating)),
      title: data.title,
      comment: data.comment,
      images: data.images || [],
      status: "APPROVED",
      // Auto-approve for smooth UX, admin can moderate
      verifiedPurchase: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.reviews.unshift(newReview);
    const approvedReviews = this.reviews.filter((r) => r.productId === data.productId && r.status === "APPROVED");
    const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
    product.rating = Number(avgRating.toFixed(1));
    product.reviewCount = approvedReviews.length;
    return newReview;
  }
  moderateReview(reviewId, status) {
    const review = this.reviews.find((r) => r.id === reviewId);
    if (!review) return null;
    review.status = status;
    return review;
  }
  deleteReview(reviewId) {
    const index = this.reviews.findIndex((r) => r.id === reviewId);
    if (index === -1) return false;
    this.reviews.splice(index, 1);
    return true;
  }
  // --- COUPONS ---
  getCoupons() {
    return [...this.coupons];
  }
  validateCoupon(code, subtotal) {
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);
    if (!coupon) {
      return { valid: false, discountAmount: 0, message: "Invalid or expired coupon code" };
    }
    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, message: "This coupon code has expired" };
    }
    if (coupon.timesUsed >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, message: "Coupon usage limit has been reached" };
    }
    if (subtotal < coupon.minSpend) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum spend of $${coupon.minSpend.toFixed(2)} required for coupon ${coupon.code}`
      };
    }
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = subtotal * coupon.value / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = Math.min(coupon.value, subtotal);
    }
    return {
      valid: true,
      coupon,
      discountAmount: Number(discount.toFixed(2)),
      message: `Coupon ${coupon.code} applied! Saved $${discount.toFixed(2)}`
    };
  }
  createCoupon(data) {
    const newCoupon = {
      id: `coup-${Date.now()}`,
      code: (data.code || "COUPON").toUpperCase().trim(),
      discountType: data.discountType || "PERCENTAGE",
      value: Number(data.value) || 10,
      minSpend: Number(data.minSpend) || 0,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : void 0,
      expiryDate: data.expiryDate || new Date(Date.now() + 30 * 24 * 3600 * 1e3).toISOString(),
      usageLimit: Number(data.usageLimit) || 500,
      timesUsed: 0,
      isActive: true
    };
    this.coupons.unshift(newCoupon);
    return newCoupon;
  }
  toggleCoupon(id) {
    const coupon = this.coupons.find((c) => c.id === id);
    if (!coupon) return null;
    coupon.isActive = !coupon.isActive;
    return coupon;
  }
  deleteCoupon(id) {
    const index = this.coupons.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.coupons.splice(index, 1);
    return true;
  }
  // --- BANNERS ---
  getBanners() {
    return [...this.banners].filter((b) => b.isActive).sort((a, b) => a.order - b.order);
  }
  getAllBanners() {
    return [...this.banners].sort((a, b) => a.order - b.order);
  }
  createBanner(data) {
    const newBanner = {
      id: `ban-${Date.now()}`,
      title: data.title || "New Banner",
      subtitle: data.subtitle,
      badge: data.badge,
      linkUrl: data.linkUrl || "/catalog",
      imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80",
      type: data.type || "HERO_SLIDER",
      order: data.order || this.banners.length + 1,
      isActive: true,
      bgColor: data.bgColor || "#1e1b4b",
      accentColor: data.accentColor || "#f97316"
    };
    this.banners.push(newBanner);
    return newBanner;
  }
  updateBanner(id, data) {
    const index = this.banners.findIndex((b) => b.id === id);
    if (index === -1) return null;
    this.banners[index] = { ...this.banners[index], ...data };
    return this.banners[index];
  }
  deleteBanner(id) {
    const index = this.banners.findIndex((b) => b.id === id);
    if (index === -1) return false;
    this.banners.splice(index, 1);
    return true;
  }
  // --- USERS / CUSTOMERS ---
  getUsers() {
    return [...this.users];
  }
  getUserById(id) {
    return this.users.find((u) => u.id === id) || null;
  }
  getUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }
  createUser(data) {
    const newUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      role: data.role || "CUSTOMER",
      isSuspended: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }
  updateUser(id, data) {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, data);
    return user;
  }
  toggleSuspendUser(id) {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    user.isSuspended = !user.isSuspended;
    return user;
  }
  deleteUser(id) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
  // --- ADDRESSES ---
  getUserAddresses(userId) {
    return this.addresses.filter((a) => a.userId === userId);
  }
  addAddress(data) {
    if (data.isDefault) {
      this.addresses.filter((a) => a.userId === data.userId).forEach((a) => {
        a.isDefault = false;
      });
    }
    const newAddress = {
      ...data,
      id: `addr-${Date.now()}`
    };
    this.addresses.push(newAddress);
    return newAddress;
  }
  updateAddress(id, data) {
    const addr = this.addresses.find((a) => a.id === id);
    if (!addr) return null;
    if (data.isDefault) {
      this.addresses.filter((a) => a.userId === addr.userId).forEach((a) => {
        a.isDefault = false;
      });
    }
    Object.assign(addr, data);
    return addr;
  }
  deleteAddress(id) {
    const index = this.addresses.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.addresses.splice(index, 1);
    return true;
  }
  // --- NOTIFICATIONS ---
  getNotifications(userId) {
    return this.notifications.filter((n) => n.userId === null || n.userId === userId);
  }
  createNotification(data) {
    const item = {
      id: `notif-${Date.now()}`,
      userId: data.userId ?? null,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: false,
      linkUrl: data.linkUrl,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.notifications.unshift(item);
    return item;
  }
  markNotificationRead(id) {
    const item = this.notifications.find((n) => n.id === id);
    if (!item) return false;
    item.isRead = true;
    return true;
  }
  markAllNotificationsRead(userId) {
    this.notifications.filter((n) => n.userId === null || n.userId === userId).forEach((n) => {
      n.isRead = true;
    });
  }
  // --- STORE SETTINGS ---
  getSettings() {
    return { ...this.settings };
  }
  updateSettings(data) {
    this.settings = { ...this.settings, ...data };
    return { ...this.settings };
  }
  // --- ADMIN DASHBOARD ANALYTICS ---
  getDashboardStats() {
    const nonCancelledOrders = this.orders.filter((o) => o.status !== "CANCELLED");
    const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = this.orders.length;
    const totalCustomers = this.users.filter((u) => u.role === "CUSTOMER").length;
    const totalProducts = this.products.filter((p) => !p.isArchived).length;
    const pendingOrders = this.orders.filter((o) => ["PENDING", "CONFIRMED", "PROCESSING"].includes(o.status)).length;
    const deliveredOrders = this.orders.filter((o) => o.status === "DELIVERED").length;
    const cancelledOrders = this.orders.filter((o) => o.status === "CANCELLED").length;
    const monthlySales = [
      { month: "Sep", revenue: 4200, orders: 48 },
      { month: "Oct", revenue: 5800, orders: 62 },
      { month: "Nov", revenue: 8400, orders: 95 },
      { month: "Dec", revenue: 12600, orders: 140 },
      { month: "Jan", revenue: 9800, orders: 105 },
      { month: "Feb", revenue: 11450, orders: 128 }
    ];
    const weeklyOrders = [
      { day: "Mon", orders: 18, revenue: 1650 },
      { day: "Tue", orders: 24, revenue: 2100 },
      { day: "Wed", orders: 20, revenue: 1800 },
      { day: "Thu", orders: 29, revenue: 2650 },
      { day: "Fri", orders: 35, revenue: 3200 },
      { day: "Sat", orders: 42, revenue: 3950 },
      { day: "Sun", orders: 38, revenue: 3400 }
    ];
    const categoryDistribution = this.categories.map((cat) => {
      const prods = this.products.filter((p) => p.categoryId === cat.id);
      const val = prods.reduce((sum, p) => sum + p.price * p.soldCount, 0);
      return {
        name: cat.name,
        count: prods.length,
        value: val || 500
      };
    });
    const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;
    const lowStockProducts = this.products.filter((p) => p.quantity < 5 && !p.isArchived);
    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      averageOrderValue,
      revenueGrowth: 18.4,
      ordersGrowth: 12.8,
      monthlySales,
      weeklyOrders,
      categoryDistribution,
      recentOrders: this.orders.slice(0, 6),
      lowStockProducts
    };
  }
};
var dbStore = new DataStore();

// src/server/firebase-admin.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import path2 from "path";
import { readFileSync } from "fs";
var serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const envVal = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    if (envVal.startsWith("{")) {
      serviceAccount = JSON.parse(envVal);
    } else {
      const decoded = Buffer.from(envVal, "base64").toString("utf-8");
      serviceAccount = JSON.parse(decoded);
    }
  } catch (err) {
    console.error("\u274C Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", err);
  }
}
if (!serviceAccount) {
  try {
    const serviceAccountPath = path2.resolve(
      process.cwd(),
      "velora-store-5f44c-firebase-adminsdk-fbsvc-1ad61a2d7b.json"
    );
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  } catch (err) {
    console.error("\u274C Failed to load Firebase service account key from file:", err);
  }
}
if (getApps().length === 0 && serviceAccount) {
  try {
    initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (err) {
    console.error("\u274C Failed to initialize Firebase Admin app:", err);
  }
}
var adminAuth = getApps().length > 0 ? getAuth() : null;
var db = getApps().length > 0 ? getFirestore() : null;

// src/server/middleware/requireAdmin.ts
async function requireAdmin(req, res, next) {
  if (!adminAuth || !db) {
    return res.status(500).json({
      error: "Server Configuration Error",
      message: "Firebase Admin SDK is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT environment variable."
    });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid Authorization header. Expected: Bearer <idToken>"
    });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;
    if (!email) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Firebase token does not contain an email address."
      });
    }
    const adminDoc = await db.collection("velorastoreadmins").doc(email).get();
    if (!adminDoc.exists) {
      return res.status(403).json({
        error: "Access Denied",
        message: "Your Google account is not authorized to access the admin dashboard."
      });
    }
    req.adminUser = {
      uid: decodedToken.uid,
      email,
      name: decodedToken.name,
      picture: decodedToken.picture
    };
    next();
  } catch (error) {
    console.error("Admin auth error:", error.message);
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        error: "Token Expired",
        message: "Your session has expired. Please sign in again."
      });
    }
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authentication token."
    });
  }
}

// src/server/routes/api.ts
var apiRouter = Router();
apiRouter.post("/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    let user = dbStore.getUserByEmail(email);
    if (!user) {
      if (email.includes("admin")) {
        user = dbStore.createUser({
          name: "Administrator",
          email,
          role: "ADMIN"
        });
      } else {
        user = dbStore.createUser({
          name: email.split("@")[0].replace(".", " "),
          email,
          role: "CUSTOMER"
        });
      }
    }
    if (user.isSuspended) {
      return res.status(403).json({ error: "Your account has been suspended. Please contact support." });
    }
    const token = `token_${user.id}_${Date.now()}`;
    return res.json({
      user,
      token,
      refreshToken: `ref_${user.id}_${Date.now()}`,
      message: "Login successful"
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Authentication error" });
  }
});
apiRouter.post("/auth/register", (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    const existing = dbStore.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const user = dbStore.createUser({
      name,
      email,
      phone,
      role: "CUSTOMER"
    });
    const token = `token_${user.id}_${Date.now()}`;
    return res.status(201).json({
      user,
      token,
      message: "Account created successfully"
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Registration error" });
  }
});
apiRouter.post("/auth/reset-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  return res.json({ message: `Password reset instructions have been sent to ${email}` });
});
apiRouter.post("/auth/admin-login", async (req, res) => {
  try {
    if (!adminAuth || !db) {
      return res.status(500).json({
        error: "Server Configuration Error",
        message: "Firebase Admin SDK is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT environment variable."
      });
    }
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "Firebase ID token is required" });
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;
    if (!email) {
      return res.status(401).json({ error: "Google account does not have an email address." });
    }
    const adminDoc = await db.collection("velorastoreadmins").doc(email).get();
    if (!adminDoc.exists) {
      return res.status(403).json({
        error: "Access Denied",
        message: `The email ${email} is not authorized to access the admin dashboard.`
      });
    }
    let user = dbStore.getUserByEmail(email);
    if (!user) {
      user = dbStore.createUser({
        name: decodedToken.name || "Administrator",
        email,
        role: "ADMIN"
      });
    } else if (user.role !== "ADMIN") {
      user = dbStore.updateUser(user.id, { role: "ADMIN" });
    }
    return res.json({
      user: {
        ...user,
        avatar: decodedToken.picture || user.avatar,
        name: decodedToken.name || user.name
      },
      isAdmin: true,
      message: "Admin login successful"
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Token expired. Please sign in again." });
    }
    return res.status(401).json({ error: "Invalid authentication token." });
  }
});
apiRouter.put("/auth/profile", (req, res) => {
  const { userId, name, phone, avatar } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID is required" });
  const updated = dbStore.updateUser(userId, { name, phone, avatar });
  if (!updated) return res.status(404).json({ error: "User not found" });
  return res.json({ user: updated, message: "Profile updated" });
});
apiRouter.get("/products", (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      onSaleOnly,
      flashSaleOnly,
      sortBy,
      page,
      limit
    } = req.query;
    const result = dbStore.getProducts({
      search,
      category,
      brand,
      minPrice: minPrice ? Number(minPrice) : void 0,
      maxPrice: maxPrice ? Number(maxPrice) : void 0,
      minRating: minRating ? Number(minRating) : void 0,
      inStockOnly: inStockOnly === "true",
      onSaleOnly: onSaleOnly === "true",
      flashSaleOnly: flashSaleOnly === "true",
      sortBy,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
apiRouter.get("/products/:idOrSlug", (req, res) => {
  const product = dbStore.getProductById(req.params.idOrSlug);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  const reviews = dbStore.getReviews(product.id);
  return res.json({ product, reviews });
});
apiRouter.post("/products", requireAdmin, (req, res) => {
  try {
    const product = dbStore.createProduct(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
apiRouter.put("/products/:id", requireAdmin, (req, res) => {
  try {
    const product = dbStore.updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
apiRouter.delete("/products/:id", requireAdmin, (req, res) => {
  const ok = dbStore.deleteProduct(req.params.id);
  if (!ok) return res.status(404).json({ error: "Product not found" });
  return res.json({ success: true, message: "Product deleted" });
});
apiRouter.patch("/products/:id/archive", requireAdmin, (req, res) => {
  const product = dbStore.toggleArchiveProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  return res.json(product);
});
apiRouter.get("/categories", (_req, res) => {
  return res.json(dbStore.getCategories());
});
apiRouter.post("/categories", requireAdmin, (req, res) => {
  try {
    const category = dbStore.createCategory(req.body);
    return res.status(201).json(category);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
apiRouter.put("/categories/:id", requireAdmin, (req, res) => {
  const cat = dbStore.updateCategory(req.params.id, req.body);
  if (!cat) return res.status(404).json({ error: "Category not found" });
  return res.json(cat);
});
apiRouter.delete("/categories/:id", requireAdmin, (req, res) => {
  const ok = dbStore.deleteCategory(req.params.id);
  if (!ok) return res.status(404).json({ error: "Category not found" });
  return res.json({ success: true });
});
apiRouter.get("/cart", (req, res) => {
  const userId = req.query.userId || "user-cust-1";
  return res.json(dbStore.getCart(userId));
});
apiRouter.post("/cart", (req, res) => {
  const { userId = "user-cust-1", productId, quantity = 1, variant } = req.body;
  if (!productId) return res.status(400).json({ error: "productId is required" });
  try {
    const cart = dbStore.addToCart(userId, productId, quantity, variant);
    return res.json(cart);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
apiRouter.put("/cart/:itemId", (req, res) => {
  const { userId = "user-cust-1", quantity } = req.body;
  const cart = dbStore.updateCartItem(userId, req.params.itemId, quantity);
  return res.json(cart);
});
apiRouter.delete("/cart/:itemId", (req, res) => {
  const userId = req.query.userId || "user-cust-1";
  const cart = dbStore.removeCartItem(userId, req.params.itemId);
  return res.json(cart);
});
apiRouter.delete("/cart", (req, res) => {
  const userId = req.query.userId || "user-cust-1";
  dbStore.clearCart(userId);
  return res.json([]);
});
apiRouter.get("/wishlist", (req, res) => {
  const userId = req.query.userId || "user-cust-1";
  return res.json(dbStore.getWishlist(userId));
});
apiRouter.post("/wishlist/toggle", (req, res) => {
  const { userId = "user-cust-1", productId } = req.body;
  if (!productId) return res.status(400).json({ error: "productId required" });
  const result = dbStore.toggleWishlist(userId, productId);
  return res.json(result);
});
apiRouter.get("/orders", (req, res) => {
  const userId = req.query.userId;
  return res.json(dbStore.getOrders(userId));
});
apiRouter.get("/orders/:id", (req, res) => {
  const order = dbStore.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  return res.json(order);
});
apiRouter.post("/orders", (req, res) => {
  try {
    const { userId = "user-cust-1", address, items, paymentMethod, couponCode, customerNotes } = req.body;
    if (!address || !items || items.length === 0) {
      return res.status(400).json({ error: "Address and items are required" });
    }
    const order = dbStore.createOrder({
      userId,
      address,
      items,
      paymentMethod: paymentMethod || "PAYPAL",
      couponCode,
      customerNotes
    });
    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
apiRouter.patch("/orders/:id/status", (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });
  const updated = dbStore.updateOrderStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: "Order not found" });
  return res.json(updated);
});
apiRouter.patch("/orders/:id/tracking", (req, res) => {
  const { trackingNumber, trackingCode } = req.body;
  const code = trackingNumber || trackingCode;
  if (!code) return res.status(400).json({ error: "Tracking code is required" });
  const order = dbStore.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  order.trackingCode = code;
  order.trackingNumber = code;
  return res.json(order);
});
apiRouter.post("/orders/:id/cancel", (req, res) => {
  const { userId = "user-cust-1", reason } = req.body;
  try {
    const updated = dbStore.cancelOrder(req.params.id, userId, reason);
    if (!updated) return res.status(404).json({ error: "Order not found" });
    return res.json({ order: updated, message: "Order has been cancelled successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
apiRouter.get("/coupons", (_req, res) => {
  return res.json(dbStore.getCoupons());
});
apiRouter.post("/coupons/validate", (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: "Code is required" });
  const result = dbStore.validateCoupon(code, Number(subtotal) || 0);
  return res.json(result);
});
apiRouter.post("/coupons", requireAdmin, (req, res) => {
  try {
    const coupon = dbStore.createCoupon(req.body);
    return res.status(201).json(coupon);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
apiRouter.patch("/coupons/:id/toggle", requireAdmin, (req, res) => {
  const coupon = dbStore.toggleCoupon(req.params.id);
  if (!coupon) return res.status(404).json({ error: "Coupon not found" });
  return res.json(coupon);
});
apiRouter.delete("/coupons/:id", requireAdmin, (req, res) => {
  const ok = dbStore.deleteCoupon(req.params.id);
  if (!ok) return res.status(404).json({ error: "Coupon not found" });
  return res.json({ success: true });
});
apiRouter.get("/reviews", (req, res) => {
  const productId = req.query.productId;
  return res.json(dbStore.getReviews(productId));
});
apiRouter.post("/reviews", (req, res) => {
  try {
    const { userId = "user-cust-1", productId, rating, title, comment, images } = req.body;
    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ error: "Missing required review fields" });
    }
    const review = dbStore.createReview({ userId, productId, rating: Number(rating), title, comment, images });
    return res.status(201).json(review);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
apiRouter.patch("/reviews/:id/moderate", requireAdmin, (req, res) => {
  const { status } = req.body;
  const review = dbStore.moderateReview(req.params.id, status);
  if (!review) return res.status(404).json({ error: "Review not found" });
  return res.json(review);
});
apiRouter.delete("/reviews/:id", requireAdmin, (req, res) => {
  const ok = dbStore.deleteReview(req.params.id);
  if (!ok) return res.status(404).json({ error: "Review not found" });
  return res.json({ success: true });
});
apiRouter.get("/banners", (req, res) => {
  const all = req.query.all === "true";
  return res.json(all ? dbStore.getAllBanners() : dbStore.getBanners());
});
apiRouter.post("/banners", requireAdmin, (req, res) => {
  const banner = dbStore.createBanner(req.body);
  return res.status(201).json(banner);
});
apiRouter.put("/banners/:id", requireAdmin, (req, res) => {
  const banner = dbStore.updateBanner(req.params.id, req.body);
  if (!banner) return res.status(404).json({ error: "Banner not found" });
  return res.json(banner);
});
apiRouter.delete("/banners/:id", requireAdmin, (req, res) => {
  const ok = dbStore.deleteBanner(req.params.id);
  if (!ok) return res.status(404).json({ error: "Banner not found" });
  return res.json({ success: true });
});
apiRouter.get("/addresses", (req, res) => {
  const userId = req.query.userId || "user-cust-1";
  return res.json(dbStore.getUserAddresses(userId));
});
apiRouter.post("/addresses", (req, res) => {
  const { userId = "user-cust-1", title, fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;
  if (!fullName || !phone || !street || !city || !postalCode) {
    return res.status(400).json({ error: "Required address fields missing" });
  }
  const addr = dbStore.addAddress({ userId, title: title || "Home", fullName, phone, street, city, state, postalCode, country: country || "United States", isDefault: Boolean(isDefault) });
  return res.status(201).json(addr);
});
apiRouter.put("/addresses/:id", (req, res) => {
  const addr = dbStore.updateAddress(req.params.id, req.body);
  if (!addr) return res.status(404).json({ error: "Address not found" });
  return res.json(addr);
});
apiRouter.patch("/addresses/:id/default", (req, res) => {
  const userId = req.query.userId || "user-cust-1";
  const addrs = dbStore.getUserAddresses(userId);
  addrs.forEach((a) => {
    a.isDefault = a.id === req.params.id;
  });
  return res.json(addrs);
});
apiRouter.delete("/addresses/:id", (req, res) => {
  const ok = dbStore.deleteAddress(req.params.id);
  if (!ok) return res.status(404).json({ error: "Address not found" });
  return res.json({ success: true });
});
apiRouter.get("/notifications", (req, res) => {
  const userId = req.query.userId;
  return res.json(dbStore.getNotifications(userId));
});
apiRouter.post("/notifications", (req, res) => {
  const { title, message, type = "PROMOTIONAL", userId, linkUrl } = req.body;
  if (!title || !message) return res.status(400).json({ error: "Title and message are required" });
  const notif = dbStore.createNotification({ title, message, type, userId, linkUrl });
  return res.status(201).json(notif);
});
apiRouter.patch("/notifications/:id/read", (req, res) => {
  const ok = dbStore.markNotificationRead(req.params.id);
  return res.json({ success: ok });
});
apiRouter.post("/notifications/read-all", (req, res) => {
  const { userId } = req.body;
  dbStore.markAllNotificationsRead(userId);
  return res.json({ success: true });
});
apiRouter.get("/settings", (_req, res) => {
  return res.json(dbStore.getSettings());
});
apiRouter.put("/settings", requireAdmin, (req, res) => {
  const settings = dbStore.updateSettings(req.body);
  return res.json(settings);
});
apiRouter.get("/admin/stats", requireAdmin, (_req, res) => {
  return res.json(dbStore.getDashboardStats());
});
apiRouter.get("/admin/customers", requireAdmin, (_req, res) => {
  const users = dbStore.getUsers().filter((u) => u.role === "CUSTOMER");
  const enriched = users.map((user) => {
    const orders = dbStore.getOrders(user.id);
    const totalSpent = orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      ...user,
      orderCount: orders.length,
      totalSpent: Number(totalSpent.toFixed(2)),
      lastOrderDate: orders[0]?.createdAt || null,
      orders
    };
  });
  return res.json(enriched);
});
apiRouter.patch("/admin/customers/:id/role", requireAdmin, (req, res) => {
  const { role } = req.body;
  const user = dbStore.updateUser(req.params.id, { role });
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});
apiRouter.patch("/admin/customers/:id/suspend", requireAdmin, (req, res) => {
  const user = dbStore.toggleSuspendUser(req.params.id);
  if (!user) return res.status(404).json({ error: "Customer not found" });
  return res.json(user);
});
apiRouter.delete("/admin/customers/:id", requireAdmin, (req, res) => {
  const ok = dbStore.deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ error: "Customer not found" });
  return res.json({ success: true });
});

// src/server/serverless.ts
var app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.get(["/health", "/api/health"], (_req, res) => {
  res.json({ status: "ok", name: "BazaarNova API", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use("/api", apiRouter);
app.use("/", apiRouter);
app.use((err, _req, res, _next) => {
  console.error("API Error:", err);
  res.status(500).json({ error: err?.message || "Internal Server Error" });
});
var serverless_default = app;
export {
  serverless_default as default
};
