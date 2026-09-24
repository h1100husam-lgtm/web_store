/* =========================================================================
   data.js  |  Store catalog (products + categories)
   -------------------------------------------------------------------------
   This file is the single source of truth for the products.
   It replaces the old `fetch('products.json')` call so the whole site also
   works when you open index.html directly from the file system (file://).
   ========================================================================= */

/* Categories used by the header dropdown, the nav menu and the shop page.
   They are generated from the data, so they never get out of sync.        */
const CATEGORIES = [
  { slug: "electronics", name: "Electronics & Digital", icon: "fa-laptop",        short: "Electronics" },
  { slug: "mobiles",     name: "Phones & Tablets",      icon: "fa-mobile-screen", short: "Mobiles"     },
  { slug: "appliances",  name: "Home Appliances",       icon: "fa-blender",       short: "Appliances"  }
];

/* `added` = how many days ago the product was added (used for the "New"
   badge and for the "Newest" sort). `old_price` is optional (sale items). */
const PRODUCTS = [
  {
    id: 0, name: "SAMSUNG 55 Inch UHD 4K Smart TV With Receiver", category: "electronics",
    price: 350, img: "img/product/0.png", stock: 12, rating: 4.7, reviews: 128, added: 46,
    description: "A 55-inch UHD 4K Smart TV with a built-in receiver, delivering sharp contrast and rich colour through Samsung's PurColor engine. Smart Hub gives you direct access to your favourite streaming apps.",
    specs: [["Screen Size", '55"'], ["Resolution", "3840 x 2160 (4K UHD)"], ["Smart TV", "Yes - Tizen"], ["Receiver", "Built-in DVB-S2"], ["HDMI", "3 ports"], ["Warranty", "2 years"]],
    tags: ["tv", "samsung", "4k", "smart"]
  },
  {
    id: 1, name: "Redmi 13C Dual SIM with 6GB RAM", category: "mobiles",
    price: 280, img: "img/product/1.png", stock: 25, rating: 4.4, reviews: 96, added: 30,
    description: "Redmi 13C pairs a large 6.74-inch 90Hz display with a 50MP main camera and a 5000mAh battery that easily lasts a full day of mixed use.",
    specs: [["Display", '6.74" HD+ 90Hz'], ["RAM / Storage", "6GB / 128GB"], ["Camera", "50MP main + 2MP depth"], ["Battery", "5000 mAh, 18W"], ["SIM", "Dual Nano-SIM"], ["Warranty", "1 year"]],
    tags: ["xiaomi", "redmi", "phone", "dual sim"]
  },
  {
    id: 2, name: "Dell Laptop Latitude 5530 Core i7-1255U 8GB SSD", category: "electronics",
    price: 400, img: "img/product/2.png", stock: 7, rating: 4.6, reviews: 54, added: 62,
    description: "A business-class Latitude 5530 with a 12th-gen Intel Core i7, fast NVMe SSD storage and the durability Dell is known for. Ideal for work, study and development.",
    specs: [["CPU", "Intel Core i7-1255U"], ["RAM", "8GB DDR4"], ["Storage", "512GB NVMe SSD"], ["Display", '15.6" FHD Anti-Glare'], ["OS", "Windows 11 Pro"], ["Warranty", "1 year"]],
    tags: ["dell", "laptop", "i7", "business"]
  },
  {
    id: 3, name: "Canon EOS RP Mirrorless Camera", category: "electronics",
    price: 530, img: "img/product/3.png", stock: 4, rating: 4.8, reviews: 71, added: 88,
    description: "The compact full-frame EOS RP mirrorless camera with a 26.2MP sensor, 4K video and Dual Pixel CMOS AF - a lightweight body with professional image quality.",
    specs: [["Sensor", "26.2MP Full Frame CMOS"], ["Video", "4K UHD / Full HD 60p"], ["Autofocus", "Dual Pixel CMOS AF, 4779 points"], ["Screen", '3" Vari-angle Touchscreen'], ["Mount", "Canon RF"], ["Warranty", "1 year"]],
    tags: ["canon", "camera", "mirrorless", "4k"]
  },
  {
    id: 4, name: "OPPO A18 128GB 4GB Glowing Black", category: "mobiles",
    price: 250, img: "img/product/4.png", stock: 30, rating: 4.2, reviews: 63, added: 18,
    description: "OPPO A18 in Glowing Black with a bright 6.56-inch display, a 5000mAh battery and an AI 8MP main camera - great everyday value.",
    specs: [["Display", '6.56" HD+ 90Hz'], ["RAM / Storage", "4GB / 128GB"], ["Camera", "8MP AI main"], ["Battery", "5000 mAh"], ["OS", "Android 13, ColorOS 13.1"], ["Warranty", "1 year"]],
    tags: ["oppo", "phone", "a18"]
  },
  {
    id: 5, name: "Samsung 27-Inch G55C Odyssey QHD 4k", category: "electronics",
    price: 280, img: "img/product/5.png", stock: 9, rating: 4.5, reviews: 42, added: 25,
    description: "A 27-inch curved Odyssey G55C gaming monitor with QHD resolution and a 165Hz refresh rate for smooth, tear-free gameplay.",
    specs: [["Screen Size", '27" Curved 1000R'], ["Resolution", "QHD 2560 x 1440"], ["Refresh Rate", "165Hz"], ["Response Time", "1ms (MPRT)"], ["Sync", "AMD FreeSync Premium"], ["Warranty", "2 years"]],
    tags: ["samsung", "monitor", "gaming", "odyssey"]
  },
  {
    id: 6, name: "Infinix Smart (Galaxy White, 4GB RAM, 64GB Storage)", category: "mobiles",
    price: 220, old_price: 300, img: "img/product/6.png", stock: 18, rating: 4.0, reviews: 37, added: 12,
    description: "Infinix Smart in Galaxy White - a slim, light phone with a 6.6-inch display, 4GB RAM and a long-lasting 5000mAh battery.",
    specs: [["Display", '6.6" HD+'], ["RAM / Storage", "4GB / 64GB"], ["Camera", "13MP dual AI"], ["Battery", "5000 mAh"], ["Colour", "Galaxy White"], ["Warranty", "1 year"]],
    tags: ["infinix", "phone", "budget"]
  },
  {
    id: 7, name: "HP Victus Gaming Laptop 8RAM SSD", category: "electronics",
    price: 370, img: "img/product/7.png", stock: 6, rating: 4.4, reviews: 58, added: 70,
    description: "HP Victus gaming laptop with dedicated graphics, a high refresh-rate display and an SSD for fast load times - built for gaming and heavy multitasking.",
    specs: [["CPU", "Intel Core i5 12th Gen"], ["RAM", "8GB DDR4"], ["Storage", "512GB PCIe SSD"], ["Graphics", "NVIDIA GeForce GTX 1650"], ["Display", '15.6" FHD 144Hz'], ["Warranty", "1 year"]],
    tags: ["hp", "laptop", "gaming", "victus"]
  },
  {
    id: 8, name: "Xiaomi Redmi 13C Dual SIM 8GB", category: "mobiles",
    price: 320, img: "img/product/8.png", stock: 22, rating: 4.5, reviews: 84, added: 8,
    description: "The 8GB version of Redmi 13C with a 90Hz display, 50MP camera and 18W fast charging - more headroom for apps and games.",
    specs: [["Display", '6.74" HD+ 90Hz'], ["RAM / Storage", "8GB / 256GB"], ["Camera", "50MP AI triple"], ["Battery", "5000 mAh, 18W"], ["SIM", "Dual Nano-SIM"], ["Warranty", "1 year"]],
    tags: ["xiaomi", "redmi", "phone"]
  },
  {
    id: 9, name: "Handheld Barcode Scanner 1D/2D/QR Code", category: "electronics",
    price: 80, old_price: 100, img: "img/product/9.png", stock: 40, rating: 4.1, reviews: 21, added: 55,
    description: "A wired handheld scanner that reads 1D and 2D barcodes, including QR codes on screens. Plug and play over USB - perfect for shops and warehouses.",
    specs: [["Scan Type", "1D / 2D / QR"], ["Interface", "USB (plug & play)"], ["Scan Speed", "up to 300 scans/sec"], ["Reads from screen", "Yes"], ["Cable Length", "1.8 m"], ["Warranty", "6 months"]],
    tags: ["scanner", "barcode", "accessory"]
  },
  {
    id: 10, name: "Large Venue Building Mapping Projector", category: "electronics",
    price: 300, img: "img/product/10.png", stock: 3, rating: 4.3, reviews: 12, added: 95,
    description: "A high-brightness projector designed for large venues, halls and building mapping, with 5000 ANSI lumens and flexible lens shift.",
    specs: [["Brightness", "5000 ANSI Lumens"], ["Resolution", "WUXGA 1920 x 1200"], ["Contrast", "3,000,000:1"], ["Lamp Life", "up to 20,000 h"], ["Inputs", "HDMI x2, VGA, USB"], ["Warranty", "2 years"]],
    tags: ["projector", "venue"]
  },
  {
    id: 11, name: "Infinix Hot 40i (RAM: 4+4GB, 128GB)", category: "mobiles",
    price: 260, old_price: 300, img: "img/product/11.png", stock: 15, rating: 4.2, reviews: 49, added: 5,
    description: "Infinix Hot 40i with expandable RAM (4+4GB), 128GB storage and a 90Hz display - a balanced choice for everyday performance.",
    specs: [["Display", '6.56" HD+ 90Hz'], ["RAM / Storage", "4GB (+4GB extended) / 128GB"], ["Camera", "50MP AI"], ["Battery", "5000 mAh, 18W"], ["OS", "Android 13, XOS 13.5"], ["Warranty", "1 year"]],
    tags: ["infinix", "phone", "hot 40i"]
  },
  {
    id: 12, name: "HP DeskJet 2710 Printer, All-in-One", category: "electronics",
    price: 370, img: "img/product/12.png", stock: 11, rating: 4.0, reviews: 33, added: 78,
    description: "An all-in-one DeskJet that prints, scans and copies, with wireless printing from your phone or laptop and an affordable ink system.",
    specs: [["Functions", "Print / Scan / Copy"], ["Print Speed", "up to 7.5 ppm (black)"], ["Connectivity", "Wi-Fi, USB 2.0"], ["Duplex", "Manual"], ["Monthly Duty", "up to 1000 pages"], ["Warranty", "1 year"]],
    tags: ["hp", "printer", "all in one"]
  },
  {
    id: 13, name: "Fuzzy Logic Rice Cooker DIGITAL-JAR 1.8L 940W - HD4515/67", category: "appliances",
    price: 490, img: "img/product/13.png", stock: 8, rating: 4.6, reviews: 44, added: 40,
    description: "A 1.8L digital rice cooker with fuzzy-logic temperature control that adjusts cooking automatically for perfectly fluffy rice every time.",
    specs: [["Capacity", "1.8 L"], ["Power", "940 W"], ["Control", "Digital, Fuzzy Logic"], ["Programs", "Rice / Porridge / Steam / Keep warm"], ["Inner Pot", "Non-stick, removable"], ["Warranty", "2 years"]],
    tags: ["rice cooker", "kitchen", "philips"]
  },
  {
    id: 14, name: "Sencor STS 5070SS Electric Toaster for Four Slices", category: "appliances",
    price: 340, img: "img/product/14.png", stock: 14, rating: 4.3, reviews: 26, added: 33,
    description: "A stainless-steel four-slice toaster with six browning levels, defrost and reheat functions, plus removable crumb trays for easy cleaning.",
    specs: [["Slices", "4 (2 x 2 slots)"], ["Power", "1400 W"], ["Browning Levels", "6"], ["Functions", "Defrost / Reheat / Cancel"], ["Body", "Stainless Steel"], ["Warranty", "2 years"]],
    tags: ["toaster", "kitchen", "sencor"]
  },
  {
    id: 15, name: "Infinix Smart 6 Plus (Miracle Black)", category: "mobiles",
    price: 240, old_price: 300, img: "img/product/15.png", stock: 20, rating: 4.1, reviews: 52, added: 15,
    description: "Infinix Smart 6 Plus in Miracle Black with a big 6.82-inch display and a 5000mAh battery - simple, reliable and easy on the pocket.",
    specs: [["Display", '6.82" HD+'], ["RAM / Storage", "3GB / 64GB"], ["Camera", "8MP dual AI"], ["Battery", "5000 mAh"], ["Colour", "Miracle Black"], ["Warranty", "1 year"]],
    tags: ["infinix", "phone", "budget"]
  },
  {
    id: 16, name: "Washing Machine 959 Series 8kg Senator Aqua SX, Silver", category: "appliances",
    price: 600, old_price: 700, img: "img/product/16.png", stock: 5, rating: 4.5, reviews: 31, added: 60,
    description: "An 8kg front-load washing machine from the 959 Senator Aqua series with multiple wash programs and a quiet, energy-efficient motor.",
    specs: [["Capacity", "8 kg"], ["Type", "Front Load"], ["Spin Speed", "1200 RPM"], ["Programs", "15 wash programs"], ["Colour", "Silver"], ["Warranty", "2 years"]],
    tags: ["washing machine", "laundry"]
  },
  {
    id: 17, name: "HIKVISION PTZ Camera 4K Outdoor", category: "electronics",
    price: 185, img: "img/product/17.png", stock: 10, rating: 4.7, reviews: 39, added: 22,
    description: "A 4K outdoor PTZ security camera with motorised pan/tilt/zoom, night vision and weatherproof housing for full-area coverage.",
    specs: [["Resolution", "4K (8MP)"], ["Pan / Tilt", "360° / 90°"], ["Zoom", "Optical 4x"], ["Night Vision", "up to 50 m"], ["Protection", "IP66 weatherproof"], ["Warranty", "2 years"]],
    tags: ["hikvision", "camera", "security", "ptz"]
  },
  {
    id: 18, name: "OPPO Reno11 5G 256GB 12GB", category: "mobiles",
    price: 225, img: "img/product/18.png", stock: 13, rating: 4.6, reviews: 77, added: 3,
    description: "OPPO Reno11 5G with a 120Hz AMOLED display, a 50MP OIS camera and 67W SUPERVOOC charging - a flagship-feel phone at a mid-range price.",
    specs: [["Display", '6.7" AMOLED 120Hz'], ["RAM / Storage", "12GB / 256GB"], ["Camera", "50MP OIS + 8MP UW + 32MP front"], ["Battery", "5000 mAh, 67W SUPERVOOC"], ["Network", "5G Dual SIM"], ["Warranty", "1 year"]],
    tags: ["oppo", "reno", "5g", "phone"]
  },
  {
    id: 19, name: "VIVAX Kettle WH-175L with a capacity of 1.7L", category: "appliances",
    price: 140, img: "img/product/19.png", stock: 26, rating: 4.2, reviews: 19, added: 48,
    description: "A 1.7L stainless-steel electric kettle with a 2200W element, auto shut-off and boil-dry protection - boils a cup in under a minute.",
    specs: [["Capacity", "1.7 L"], ["Power", "2200 W"], ["Body", "Stainless Steel"], ["Safety", "Auto shut-off, boil-dry protection"], ["Base", "360° cordless"], ["Warranty", "1 year"]],
    tags: ["kettle", "kitchen", "vivax"]
  },
  {
    id: 20, name: "Kenstar Ester ABS Plastic 750W Mixer Grinder", category: "appliances",
    price: 280, old_price: 330, img: "img/product/20.png", stock: 9, rating: 4.0, reviews: 24, added: 66,
    description: "A 750W mixer grinder with three stainless-steel jars for wet grinding, dry grinding and juicing, housed in a tough ABS body.",
    specs: [["Power", "750 W"], ["Jars", "3 (1.5L / 1L / 0.4L)"], ["Speeds", "3 + pulse"], ["Body", "ABS Plastic"], ["Blades", "Stainless Steel"], ["Warranty", "2 years"]],
    tags: ["mixer", "grinder", "kitchen", "kenstar"]
  },
  {
    id: 21, name: "Multifunctional Food Processor", category: "appliances",
    price: 350, img: "img/product/21.png", stock: 7, rating: 4.4, reviews: 17, added: 36,
    description: "An all-in-one food processor that chops, slices, grates, kneads and blends, with multiple attachments and a large 2L bowl.",
    specs: [["Power", "800 W"], ["Bowl Capacity", "2 L"], ["Functions", "Chop / Slice / Grate / Knead / Blend"], ["Speeds", "2 + pulse"], ["Attachments", "5 stainless steel discs"], ["Warranty", "2 years"]],
    tags: ["food processor", "kitchen"]
  },
  {
    id: 22, name: "Zanussi Washing Machine 8 Kg 1200 RPM", category: "appliances",
    price: 580, img: "img/product/22.png", stock: 6, rating: 4.5, reviews: 28, added: 52,
    description: "A Zanussi 8kg washing machine with a 1200 RPM spin, quick-wash programs and a delay-start timer for flexible laundry days.",
    specs: [["Capacity", "8 kg"], ["Spin Speed", "1200 RPM"], ["Programs", "14 including quick 30 min"], ["Energy Class", "A++"], ["Delay Start", "up to 20 h"], ["Warranty", "2 years"]],
    tags: ["zanussi", "washing machine", "laundry"]
  },
  {
    id: 23, name: "Sharp 42 Litre Electronic Oven Convection", category: "appliances",
    price: 400, img: "img/product/23.png", stock: 8, rating: 4.3, reviews: 15, added: 74,
    description: "A 42L convection oven with electronic control, grill function and even heat distribution - big enough for family baking and roasting.",
    specs: [["Capacity", "42 L"], ["Power", "1800 W"], ["Functions", "Convection / Grill / Bake"], ["Control", "Electronic with timer"], ["Temperature", "100 - 250 °C"], ["Warranty", "2 years"]],
    tags: ["oven", "sharp", "kitchen"]
  },
  {
    id: 24, name: "Lenovo Monitor Legion R27fc-30 Gaming Curved", category: "electronics",
    price: 300, old_price: 380, img: "img/product/24.png", stock: 10, rating: 4.6, reviews: 46, added: 10,
    description: "A 27-inch curved Legion gaming monitor with 165Hz refresh, 1ms response and FreeSync Premium - built for competitive play.",
    specs: [["Screen Size", '27" Curved 1500R'], ["Resolution", "FHD 1920 x 1080"], ["Refresh Rate", "165Hz"], ["Response Time", "1ms"], ["Panel", "VA, 300 nits"], ["Warranty", "3 years"]],
    tags: ["lenovo", "monitor", "gaming", "legion"]
  }
];

/* Fake reviews pool used on the product page (demo data only). */
const REVIEW_POOL = [
  { name: "Ahmed A.",  rating: 5, text: "Exactly as described, arrived well packed. Very happy with the quality." },
  { name: "Sara M.",   rating: 4, text: "Good value for the price. Delivery took three days but the product is great." },
  { name: "Khalid O.", rating: 5, text: "Second time buying from this store - the service is reliable every time." },
  { name: "Nour H.",   rating: 3, text: "Works fine, though I expected the box to include an extra accessory." },
  { name: "Yousef T.", rating: 4, text: "Solid build and fast performance. Would recommend to a friend." },
  { name: "Lina K.",   rating: 5, text: "Better than I expected for this price range. Five stars." }
];

/* Demo account + demo orders created on first run (see store.js > seedDemoData). */
const DEMO_USER = {
  name: "Demo User",
  email: "demo@redastore.com",
  password: "123456",
  phone: "+967 712 345 678",
  address: "Hadda Street, Building 24",
  city: "Sanaa",
  country: "Yemen"
};
