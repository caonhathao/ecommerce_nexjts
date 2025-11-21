import {
  ConversationStatus,
  ConversationType,
  FulfillmentStatus,
  MessageType,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  PrismaClient,
  ProductStatus,
  Role,
  Visibility,
  VoucherType,
} from '@/lib/generated/prisma';
import { faker } from '@faker-js/faker';
import { Currency, OrderStatus } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Đang xóa dữ liệu cũ...');
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.orderVoucher.deleteMany();
  await prisma.voucherRedemption.deleteMany();
  await prisma.voucherProduct.deleteMany();
  await prisma.voucherCategory.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.review.deleteMany();
  await prisma.returnItem.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shopMember.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.address.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('🚀 Bắt đầu seed dữ liệu...');

  // ------------------------
  // 1️⃣ USERS
  // ------------------------
  const users = await Promise.all(
    Array.from({ length: 500 }).map(() =>
      prisma.user.create({
        data: {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          emailVerified: true,
          image: faker.image.avatar(),
        },
      })
    )
  );

  console.log(`✅ Created ${users.length} users`);

  // ------------------------
  // 1️⃣ SESSIONS
  // ------------------------
  const session = await Promise.all(
    Array.from({ length: 500 }).map(() =>
      prisma.session.create({
        data: {
          id: faker.string.uuid(),
          expiresAt: faker.date.future(),
          token: faker.string.uuid(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          ipAddress: faker.internet.ipv4(),
          userAgent: faker.internet.userAgent(),
          userId: faker.helpers.arrayElement(users).id,
        },
      })
    )
  );

  console.log(`✅ Created ${session.length} sessions`);

  // ------------------------
  // 1️⃣ ACCOUNTS
  // ------------------------
  const account = await Promise.all(
    Array.from({ length: 500 }).map(() =>
      prisma.account.create({
        data: {
          id: faker.string.uuid(),
          accountId: faker.string.uuid(),
          providerId: faker.company.name(),
          userId: faker.helpers.arrayElement(users).id,
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          password: null,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      })
    )
  );

  console.log(`✅ Created ${account.length} accounts`);

  // ------------------------
  // 1️⃣ VERIFICAION
  // ------------------------
  const verification = await Promise.all(
    Array.from({ length: 500 }).map(() =>
      prisma.verification.create({
        data: {
          id: faker.string.uuid(),
          identifier: faker.internet.email(),
          value: faker.string.numeric(6),
          expiresAt: faker.date.future(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      })
    )
  );

  console.log(`✅ Created ${verification.length} verifications`);

  // ------------------------
  // 1️⃣ USER PROFILE
  // ------------------------
  const userProfiles = await Promise.all(
    users.slice(0, 500).map((user) =>
      prisma.userProfile.create({
        data: {
          id: faker.string.uuid(),
          userId: user.id,
          phone: faker.phone.number(),
          emailForBill: faker.internet.email(),
          birthDate: faker.date.past({ years: 30 }),
          gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
          bio: faker.lorem.sentence(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      })
    )
  );

  console.log(`✅ Created ${userProfiles.length} userProfiles`);

  // ------------------------
  // 1️⃣ ADDRESS
  // ------------------------
  const address = await Promise.all(
    Array.from({ length: 500 }).map(() =>
      prisma.address.create({
        data: {
          id: faker.string.uuid(),
          userId: faker.helpers.arrayElement(users).id,
          fullName: faker.person.fullName(),
          phone: faker.string.numeric(10),
          line1: faker.location.streetAddress(),
          line2: faker.location.secondaryAddress(),
          ward: faker.location.state(),
          city: faker.location.city(),
          province: faker.location.state(),
          country: faker.location.country(),
          postalCode: faker.location.zipCode(),
          isDefault: faker.datatype.boolean(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          deletedAt: null,
        },
      })
    )
  );

  console.log(`✅ Created ${address.length} addresses`);

  // ------------------------
  // 1️⃣ NOTIFICATION
  // ------------------------
  const notification = await Promise.all(
    Array.from({ length: 500 }).map(() =>
      prisma.notification.create({
        data: {
          id: faker.string.uuid(),
          userId: faker.helpers.arrayElement(users).id,
          type: faker.helpers.arrayElement(['INFO', 'WARNING', 'ALERT']),
          title: faker.lorem.sentence(),
          body: faker.lorem.paragraph(),
          metadata: undefined,
          readAt: null,
          createdAt: faker.date.past(),
        },
      })
    )
  );

  console.log(`✅ Created ${notification.length} notifications`);

  // ------------------------
  // 2️⃣ SHOPS
  // ------------------------
  const shops = await Promise.all(
    users.slice(0, 100).map((user) =>
      prisma.shop.create({
        data: {
          ownerId: user.id,
          name: faker.company.name(),
          slug: faker.helpers.slugify(faker.company.name().toLowerCase()),
          description: faker.company.catchPhrase(),
          logoUrl: faker.image.urlPicsumPhotos({ width: 200, height: 200 }),
          coverUrl: faker.image.urlPicsumPhotos({ width: 800, height: 300 }),
          status: 'ACTIVE',
        },
      })
    )
  );

  console.log(`✅ Created ${shops.length} shops`);

  // ------------------------
  // 2️⃣ SHOP MEMBERS
  // ------------------------
  const usedPairs = new Set();

  const shopMembers = await Promise.all(
    users.slice(0, 200).map(async () => {
      let shopId, userId, key;

      do {
        shopId = faker.helpers.arrayElement(shops).id;
        userId = faker.helpers.arrayElement(users).id;
        key = `${shopId}_${userId}`;
      } while (usedPairs.has(key));

      usedPairs.add(key);

      return prisma.shopMember.create({
        data: {
          id: faker.string.uuid(),
          shopId,
          userId,
          role: faker.helpers.arrayElement(Object.values(Role)),
          createdAt: faker.date.past(),
        },
      });
    })
  );

  console.log(`✅ Created ${shopMembers.length} shopMemner`);

  // ------------------------
  // 3️⃣ CATEGORIES
  // ------------------------
  const categoryTree = [
    {
      name: 'Electronics',
      slug: 'electronics',
      position: 0,
      children: [
        {
          name: 'Smartphones & Accessories',
          slug: 'smartphones-accessories',
          position: 0,
        },
        {
          name: 'Computers & Laptops',
          slug: 'computers-laptops',
          position: 1,
        },
        { name: 'Audio & Headphones', slug: 'audio-headphones', position: 2 },
        { name: 'Cameras & Drones', slug: 'cameras-drones', position: 3 },
        { name: 'Smart Home & IoT', slug: 'smart-home-iot', position: 4 },
      ],
    },
    {
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      position: 1,
      children: [
        { name: 'Women’s Clothing', slug: 'womens-clothing', position: 0 },
        { name: 'Men’s Clothing', slug: 'mens-clothing', position: 1 },
        { name: 'Shoes & Footwear', slug: 'shoes-footwear', position: 2 },
        { name: 'Bags & Accessories', slug: 'bags-accessories', position: 3 },
        {
          name: 'Jewellery & Watches',
          slug: 'jewellery-watches',
          position: 4,
        },
      ],
    },
    // ... add further top‐level entries similarly
    {
      name: 'Home & Living',
      slug: 'home-living',
      position: 2,
      children: [
        { name: 'Furniture', slug: 'furniture', position: 0 },
        { name: 'Home Décor', slug: 'home-decor', position: 1 },
        { name: 'Kitchen & Dining', slug: 'kitchen-dining', position: 2 },
        { name: 'Bedding & Bath', slug: 'bedding-bath', position: 3 },
        { name: 'Lighting & Lamps', slug: 'lighting-lamps', position: 4 },
      ],
    },
    {
      name: 'Beauty & Personal Care',
      slug: 'beauty-personal-care',
      position: 3,
      children: [
        { name: 'Skincare', slug: 'skincare', position: 0 },
        { name: 'Haircare', slug: 'haircare', position: 1 },
        { name: 'Makeup & Cosmetics', slug: 'makeup-cosmetics', position: 2 },
        { name: 'Fragrances', slug: 'fragrances', position: 3 },
        {
          name: 'Wellness & Self-care',
          slug: 'wellness-selfcare',
          position: 4,
        },
      ],
    },
    {
      name: 'Food & Beverages',
      slug: 'food-beverages',
      position: 4,
      children: [
        {
          name: 'Groceries & Daily Needs',
          slug: 'groceries-daily-needs',
          position: 0,
        },
        { name: 'Snacks & Sweets', slug: 'snacks-sweets', position: 1 },
        { name: 'Drinks & Beverages', slug: 'drinks-beverages', position: 2 },
        {
          name: 'Organic & Health Foods',
          slug: 'organic-health-foods',
          position: 3,
        },
        { name: 'Gourmet & Gifts', slug: 'gourmet-gifts', position: 4 },
      ],
    },
    {
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      position: 5,
      children: [
        { name: 'Fitness Equipment', slug: 'fitness-equipment', position: 0 },
        {
          name: 'Outdoor Recreation',
          slug: 'outdoor-recreation',
          position: 1,
        },
        { name: 'Sportswear', slug: 'sportswear', position: 2 },
        { name: 'Team Sports Gear', slug: 'team-sports-gear', position: 3 },
        { name: 'Camping & Hiking', slug: 'camping-hiking', position: 4 },
      ],
    },
    {
      name: 'Health & Wellness',
      slug: 'health-wellness',
      position: 6,
      children: [
        {
          name: 'Personal Care Devices',
          slug: 'personal-care-devices',
          position: 0,
        },
        { name: 'Fitness Trackers', slug: 'fitness-trackers', position: 1 },
        { name: 'Sleep & Relaxation', slug: 'sleep-relaxation', position: 2 },
        {
          name: 'Healthy Living Products',
          slug: 'healthy-living-products',
          position: 3,
        },
        {
          name: 'Vitamins & Supplements',
          slug: 'vitamins-supplements',
          position: 4,
        },
      ],
    },
    {
      name: 'Baby, Kids & Toys',
      slug: 'baby-kids-toys',
      position: 7,
      children: [
        {
          name: 'Baby Gear & Essentials',
          slug: 'baby-gear-essentials',
          position: 0,
        },
        { name: 'Toys & Games', slug: 'toys-games', position: 1 },
        {
          name: 'Kids Clothing & Shoes',
          slug: 'kids-clothing-shoes',
          position: 2,
        },
        {
          name: 'Educational & STEM Toys',
          slug: 'educational-stem-toys',
          position: 3,
        },
        {
          name: 'Kids Furniture & Decor',
          slug: 'kids-furniture-decor',
          position: 4,
        },
      ],
    },
    {
      name: 'Books, Movies & Games',
      slug: 'books-movies-games',
      position: 8,
      children: [
        { name: 'Books & eBooks', slug: 'books-ebooks', position: 0 },
        { name: 'Movies & TV Series', slug: 'movies-tv-series', position: 1 },
        {
          name: 'Video Games & Consoles',
          slug: 'video-games-consoles',
          position: 2,
        },
        {
          name: 'Board Games & Puzzles',
          slug: 'board-games-puzzles',
          position: 3,
        },
        {
          name: 'Music & Instruments',
          slug: 'music-instruments',
          position: 4,
        },
      ],
    },
    {
      name: 'Pet Supplies',
      slug: 'pet-supplies',
      position: 9,
      children: [
        { name: 'Pet Food', slug: 'pet-food', position: 0 },
        {
          name: 'Pet Toys & Accessories',
          slug: 'pet-toys-accessories',
          position: 1,
        },
        {
          name: 'Pet Health & Grooming',
          slug: 'pet-health-grooming',
          position: 2,
        },
        {
          name: 'Aquatic & Fish Supplies',
          slug: 'aquatic-fish-supplies',
          position: 3,
        },
        {
          name: 'Pet Bedding & Habitat',
          slug: 'pet-bedding-habitat',
          position: 4,
        },
      ],
    },
    {
      name: 'Bags, Luggage & Accessories',
      slug: 'bags-luggage-accessories',
      position: 10,
      children: [
        {
          name: 'Backpacks & School Bags',
          slug: 'backpacks-school-bags',
          position: 0,
        },
        { name: 'Travel Luggage', slug: 'travel-luggage', position: 1 },
        { name: 'Handbags & Wallets', slug: 'handbags-wallets', position: 2 },
        {
          name: 'Laptop Bags & Briefcases',
          slug: 'laptop-bags-briefcases',
          position: 3,
        },
        {
          name: 'Accessories & Wallets',
          slug: 'accessories-wallets',
          position: 4,
        },
      ],
    },
    {
      name: 'Automotive & Industrial',
      slug: 'automotive-industrial',
      position: 11,
      children: [
        { name: 'Car Accessories', slug: 'car-accessories', position: 0 },
        { name: 'Motorbike Parts', slug: 'motorbike-parts', position: 1 },
        { name: 'Tools & Equipment', slug: 'tools-equipment', position: 2 },
        {
          name: 'Industrial Supplies',
          slug: 'industrial-supplies',
          position: 3,
        },
        {
          name: 'Car Electronics & Audio',
          slug: 'car-electronics-audio',
          position: 4,
        },
      ],
    },
    {
      name: 'Office Supplies & Stationery',
      slug: 'office-supplies-stationery',
      position: 12,
      children: [
        { name: 'Office Furniture', slug: 'office-furniture', position: 0 },
        {
          name: 'Printers & Supplies',
          slug: 'printers-supplies',
          position: 1,
        },
        {
          name: 'Stationery & Writing',
          slug: 'stationery-writing',
          position: 2,
        },
        { name: 'School Supplies', slug: 'school-supplies', position: 3 },
        {
          name: 'Office Tech Accessories',
          slug: 'office-tech-accessories',
          position: 4,
        },
      ],
    },
    {
      name: 'DIY, Tools & Hardware',
      slug: 'diy-tools-hardware',
      position: 13,
      children: [
        { name: 'Power Tools', slug: 'power-tools', position: 0 },
        { name: 'Hand Tools', slug: 'hand-tools', position: 1 },
        {
          name: 'Building Materials',
          slug: 'building-materials',
          position: 2,
        },
        { name: 'Home Improvement', slug: 'home-improvement', position: 3 },
        {
          name: 'Painting & Decorating',
          slug: 'painting-decorating',
          position: 4,
        },
      ],
    },
    {
      name: 'Gifts & Special Occasions',
      slug: 'gifts-special-occasions',
      position: 14,
      children: [
        { name: 'Gift Hampers', slug: 'gift-hampers', position: 0 },
        { name: 'Seasonal Decor', slug: 'seasonal-decor', position: 1 },
        { name: 'Party Supplies', slug: 'party-supplies', position: 2 },
        {
          name: 'Personalized Gifts',
          slug: 'personalized-gifts',
          position: 3,
        },
        { name: 'Greeting Cards', slug: 'greeting-cards', position: 4 },
      ],
    },
  ];

  for (const topCat of categoryTree) {
    const topId = faker.string.uuid();
    await prisma.category.create({
      data: {
        id: topId,
        parentId: null,
        name: topCat.name,
        slug: topCat.slug,
        position: topCat.position,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: null,
      },
    });
    for (const sub of topCat.children) {
      await prisma.category.create({
        data: {
          id: faker.string.uuid(),
          parentId: topId,
          name: sub.name,
          slug: sub.slug,
          position: sub.position,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          imageUrl: null,
        },
      });
    }
  }
  const categories = await prisma.category.findMany();
  console.log(
    `✅ Seeded ${categoryTree.length} top-categories with sub-categories`
  );

  // ------------------------
  // 3️⃣ TAGS
  // ------------------------
  const tags = await Promise.all(
    Array.from({ length: 100 }).map(() => {
      const name = faker.commerce.department();
      const slug = faker.helpers.slugify(name.toLowerCase());
      const uniqueSlug = `${slug}-${faker.string.alphanumeric(6).toLowerCase()}`;

      return prisma.tag.create({
        data: {
          id: faker.string.uuid(),
          name,
          slug: uniqueSlug,
        },
      });
    })
  );

  console.log(`✅ Created ${tags.length} tags`);

  // ------------------------
  // 4️⃣ PRODUCTS
  // ------------------------
  const products = await Promise.all(
    Array.from({ length: 200 }).map(() => {
      const shop = faker.helpers.arrayElement(shops);
      const category = faker.helpers.arrayElement(categories);
      const minPrice = faker.number.float({
        min: 100_000,
        max: 300_000,
        fractionDigits: 0,
      });
      const maxPrice =
        minPrice +
        faker.number.float({ min: 10_000, max: 50_000, fractionDigits: 0 });

      return prisma.product.create({
        data: {
          shopId: shop.id,
          categoryId: category.id,
          title: faker.commerce.productName(),
          slug:
            faker.helpers.slugify(faker.commerce.productName().toLowerCase()) +
            '-' +
            faker.string.alphanumeric(6).toLowerCase(),
          description: faker.commerce.productDescription(),
          origin: faker.location.country(),
          minPrice,
          maxPrice,
          status: faker.helpers.arrayElement(Object.values(ProductStatus)),
          visibility: faker.helpers.arrayElement(Object.values(Visibility)),
          soldCount: faker.number.int({ min: 10, max: 10000 }),
        },
      });
    })
  );

  console.log(`✅ Created ${products.length} products`);

  // ------------------------
  // 6️⃣ PRODUCT IMAGES
  // ------------------------
  const images = await Promise.all(
    products.flatMap((product) =>
      Array.from({ length: 3 }).map(() =>
        prisma.productImage.create({
          data: {
            productId: product.id,
            url: faker.image.urlPicsumPhotos({ width: 600, height: 600 }),
            alt: product.title,
          },
        })
      )
    )
  );

  console.log(`✅ Created ${images.length} product images`);

  // ------------------------
  // 5️⃣ PRODUCT VARIANTS
  // ------------------------
  const variants: { id: string; price: any }[] = [];

  for (const product of products) {
    for (let i = 0; i < 3; i++) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: `SKU-${faker.string.alphanumeric(8)}-${Date.now()}`,
          name: faker.commerce.productMaterial(),
          image: faker.image.urlPicsumPhotos({ width: 600, height: 600 }),
          price: faker.number.float({
            min: 100_000,
            max: 300_000,
            fractionDigits: 0,
          }),
          stock: faker.number.int({ min: 5, max: 20 }),
        },
      });
      variants.push(variant);
    }
  }

  console.log(`✅ Created ${variants.length} product variants`);

  // ------------------------
  // 5️⃣ PRODUCT TAGS
  // ------------------------
  const pairs = new Set<string>();
  const productTagData = [];

  while (productTagData.length < 5) {
    const product = faker.helpers.arrayElement(products);
    const tag = faker.helpers.arrayElement(tags);
    const key = `${product.id}-${tag.id}`;

    if (!pairs.has(key)) {
      pairs.add(key);
      productTagData.push({ productId: product.id, tagId: tag.id });
    }
  }

  const productTags = await prisma.productTag.createMany({
    data: productTagData,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${productTags.count} product variants`);

  // ------------------------
  // 7️⃣ CARTS
  // ------------------------
  const carts = await Promise.all(
    users.map((user) =>
      prisma.cart.create({
        data: {
          userId: user.id,
        },
      })
    )
  );

  console.log(`✅ Created ${carts.length} carts`);

  // ------------------------
  // 8️⃣ CART ITEMS
  // ------------------------
  const cartItems = await Promise.all(
    carts.flatMap((cart) => {
      const selectedVariants = faker.helpers.arrayElements(variants, 4);
      return selectedVariants.map((variant) =>
        prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variantId: variant.id,
            quantity: faker.number.int({ min: 1, max: 3 }),
            priceSnap: variant.price,
          },
        })
      );
    })
  );

  console.log(`✅ Created ${cartItems.length} cart items`);

  // ------------------------
  // 8️⃣ WISHLIST
  // ------------------------
  const wishlists = await Promise.all(
    users.map((user) =>
      prisma.wishlist.create({
        data: {
          id: faker.string.uuid(),
          user: { connect: { id: user.id } },
          createdAt: faker.date.past(),
        },
      })
    )
  );

  console.log(`✅ Created ${wishlists.length} wishlists`);

  // ------------------------
  // 8️⃣ WISHLIST ITEMS
  // ------------------------
  const uniquePairs = new Set();
  const wishlistItemsData = [];

  while (wishlistItemsData.length < 10) {
    const wishlist = faker.helpers.arrayElement(wishlists);
    const product = faker.helpers.arrayElement(products);
    const key = `${wishlist.id}_${product.id}`;

    if (!uniquePairs.has(key)) {
      uniquePairs.add(key);
      wishlistItemsData.push({
        id: faker.string.uuid(),
        wishlistId: wishlist.id,
        productId: product.id,
        createdAt: faker.date.past(),
      });
    }
  }

  // Tạo 1 lần duy nhất
  await prisma.wishlistItem.createMany({
    data: wishlistItemsData,
  });

  console.log(`✅ Created ${10} wishlist items`);

  // ------------------------
  // 8️⃣ ORDERS
  // ------------------------
  // ------------------------
  // 8️⃣ ORDERS (with 2-3 items each)
  // ------------------------
  console.log('🌱 Seeding orders and order items...');

  const orders = await Promise.all(
    Array.from({ length: 100 }).map(async (_, i) => {
      // --- 1. Generate 2 or 3 items' data FIRST ---
      const itemCount = faker.number.int({ min: 2, max: 3 });
      const itemsData = Array.from({ length: itemCount }).map(() => {
        const product = faker.helpers.arrayElement(products);
        const variant = faker.helpers.arrayElement(variants);
        // NOTE: Your OrderItem model might have different fields
        // This is based on your original commented-out code
        const unitPrice = faker.number.int({ min: 100000, max: 300000 });
        const quantity = faker.number.int({ min: 1, max: 5 });
        const total = unitPrice * quantity; // Calculate real total

        return {
          // Data for the OrderItem
          data: {
            id: faker.string.uuid(),
            product: { connect: { id: product.id } },
            variant: { connect: { id: variant.id } },
            title: faker.commerce.productName(),
            sku: faker.string.alphanumeric(8),
            unitPrice,
            quantity,
            discount: 0,
            total,
          },
          // Temporary value for calculating the order's total
          _calculatedTotal: total,
        };
      });

      // --- 2. Calculate real totals for the Order ---
      const itemsTotal = itemsData.reduce(
        (sum, item) => sum + item._calculatedTotal,
        0
      );
      const shippingFee = faker.number.int({ min: 0, max: 100000 });
      const discountTotal = faker.number.int({ min: 0, max: 50000 });
      const taxTotal = Math.round(itemsTotal * 0.1); // Tax based on real items
      const grandTotal = itemsTotal + shippingFee + taxTotal - discountTotal;

      // --- 3. Get user, shop, and date ---
      const user = faker.helpers.arrayElement(users);
      const shop = faker.helpers.arrayElement(shops);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 180);
      const placedAt = faker.date.between({ from: startDate, to: new Date() });

      // --- 4. Create the Order and its OrderItems in one transaction ---
      const order = await prisma.order.create({
        data: {
          id: faker.string.uuid(),
          orderNumber: `ORD-${Date.now()}-${i + 1}`,
          user: { connect: { id: user.id } },
          shop: { connect: { id: shop.id } },

          status: faker.helpers.arrayElement(Object.values(OrderStatus)),
          paymentStatus: faker.helpers.arrayElement(
            Object.values(PaymentStatus)
          ),
          fulfillmentStatus: faker.helpers.arrayElement(
            Object.values(FulfillmentStatus)
          ),
          currency: faker.helpers.arrayElement(Object.values(Currency)),

          // Use the calculated totals
          itemsTotal,
          shippingFee,
          discountTotal,
          taxTotal,
          grandTotal,

          shippingAddress: {
            name: faker.person.fullName(),
            address: faker.location.streetAddress(),
            ward: faker.location.secondaryAddress(),
            district: faker.location.city(),
            province: faker.location.state(),
          },
          billingAddress: {
            name: faker.person.fullName(),
            address: faker.location.streetAddress(),
            district: faker.location.city(),
            province: faker.location.state(),
          },

          contactEmail: faker.internet.email(),
          contactPhone: null,
          notes: faker.lorem.sentence(),
          placedAt: placedAt,
          updatedAt: placedAt,
          canceledAt: null,

          // --- THIS IS THE KEY ---
          // Use the correct relation name 'items' from your schema
          items: {
            create: itemsData.map((item) => item.data),
          },
        },
      });

      return order;
    })
  );

  // This log message is now accurate
  console.log(`✅ Created ${orders.length} orders (with 2-3 items each)`);
  // ------------------------
  // 8️⃣ ORDER ITEMS
  // ------------------------
  // const orderItems = await Promise.all(
  //   Array.from({ length: 100 }).map(() => {
  //     return prisma.orderItem.create({
  //       data: {
  //         id: faker.string.uuid(),

  //         order: { connect: { id: faker.helpers.arrayElement(orders).id } },
  //         product: { connect: { id: faker.helpers.arrayElement(products).id } },
  //         variant: { connect: { id: faker.helpers.arrayElement(variants).id } },

  //         title: faker.commerce.productName(),
  //         sku: faker.string.alphanumeric(8),
  //         unitPrice: faker.number.int({ min: 100000, max: 300000 }),
  //         quantity: faker.number.int({ min: 1, max: 5 }),
  //         discount: 0,
  //         total: 1,
  //         metadata: undefined,

  //         review: undefined,
  //       },
  //     });
  //   })
  // );

  const orderItems = await prisma.orderItem.findMany();
  console.log(`✅ Fetched ${orderItems.length} order items (from orders)`);

  // ------------------------
  // 8️⃣ PAYMENTS
  // ------------------------
  const payment = await Promise.all(
    Array.from({ length: 20 }).map(() => {
      return prisma.payment.create({
        data: {
          id: faker.string.uuid(),
          provider: faker.helpers.arrayElement(Object.values(PaymentProvider)),
          method: null,
          amount: faker.number.int({ min: 100000, max: 3000000 }),
          currency: faker.helpers.arrayElement(Object.values(Currency)),
          status: faker.helpers.arrayElement(Object.values(PaymentStatus)),
          externalId: null,
          reference: null,
          rawPayload: undefined,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      });
    })
  );

  console.log(`✅ Created ${payment.length} payments`);

  const orderPayments = await Promise.all(
    orders.map((order) => {
      const payments = faker.helpers.arrayElement(payment);
      return prisma.orderPayment.create({
        data: {
          orderId: order.id,
          paymentId: payments.id,
        },
      });
    })
  );

  console.log(`✅ Created ${orderPayments.length} order-payments`);

  // ------------------------
  // 8️⃣ SHIPMENTS
  // ------------------------
  const shipment = await Promise.all(
    Array.from({ length: 20 }).map(() => {
      return prisma.shipment.create({
        data: {
          id: faker.string.uuid(),
          order: { connect: { id: faker.helpers.arrayElement(orders).id } },

          carrier: faker.company.name(),
          trackingNumber: faker.string.alphanumeric(12).toUpperCase(),
          status: faker.helpers.arrayElement([
            'PENDING',
            'SHIPPED',
            'DELIVERED',
          ]),
          shippedAt: faker.date.recent(),
          deliveredAt: null,
          addressSnap: {
            receiver: faker.person.fullName(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            district: faker.location.city(),
            province: faker.location.state(),
          },
          createdAt: faker.date.past(),
        },
      });
    })
  );

  console.log(`✅ Created ${shipment.length} shipments`);

  // ------------------------
  // ------------------------
  // 8️⃣ REFUNDS
  // ------------------------

  const refunds = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      const order = faker.helpers.arrayElement(orders);
      const maybePayment = faker.helpers.arrayElement([...payment, null]);

      return prisma.refund.create({
        data: {
          id: faker.string.uuid(),
          order: { connect: { id: order.id } },
          ...(maybePayment
            ? { payment: { connect: { id: maybePayment.id } } }
            : {}),

          amount: faker.number.int({ min: 10_000, max: 500_000 }),
          reason: faker.helpers.arrayElement([
            'Customer canceled order',
            'Product defective',
            'Wrong item delivered',
            'Refund after return request',
          ]),
          status: 'PENDING',
          createdAt: faker.date.recent({ days: 30 }),
        },
      });
    })
  );

  console.log(`✅ Created ${refunds.length} shipments`);
  // ------------------------
  // 8️⃣ RETURN REQUESTS
  // ------------------------

  const returnRequests = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      const order = faker.helpers.arrayElement(orders);
      const user = faker.helpers.arrayElement(users);

      return prisma.returnRequest.create({
        data: {
          order: { connect: { id: order.id } },
          user: { connect: { id: user.id } },
          reason: faker.helpers.arrayElement([
            'Received damaged item',
            'Wrong product delivered',
            'Size does not fit',
            'Changed my mind',
          ]),
          status: faker.helpers.arrayElement([
            'OPEN',
            'APPROVED',
            'REJECTED',
            'CLOSED',
          ]),
          createdAt: faker.date.recent({ days: 20 }),
        },
      });
    })
  );

  console.log(`✅ Created ${returnRequests.length} shipments`);

  // ------------------------
  // ------------------------
  // 8️⃣ RETURN ITEMS
  // ------------------------

  const returnItems = await Promise.all(
    Array.from({ length: 20 }).map(async () => {
      const returnRequest = faker.helpers.arrayElement(returnRequests);
      const orderItem = faker.helpers.arrayElement(orderItems);

      return prisma.returnItem.create({
        data: {
          returnRequest: { connect: { id: returnRequest.id } },
          orderItem: { connect: { id: orderItem.id } },
          quantity: faker.number.int({ min: 1, max: 3 }),
          reason: faker.helpers.arrayElement([
            'Damaged item',
            'Wrong color',
            'Product defective',
            'Did not match description',
          ]),
        },
      });
    })
  );

  console.log(`✅ Created ${returnItems.length} return items`);
  // ------------------------
  // 8️⃣ REVIEWS
  // ------------------------

  const usedReviewKeys = new Set();
  const usedOrderItemIds = new Set();
  const reviewsData = [];

  while (reviewsData.length < 1000) {
    // Random user
    const user = faker.helpers.arrayElement(users);

    // 50% review có orderItem
    const useOrderItem = faker.datatype.boolean();
    let orderItem: any = null;

    if (useOrderItem && orderItems.length > 0) {
      let attempts = 0;
      do {
        orderItem = faker.helpers.arrayElement(orderItems);
        attempts++;
        if (attempts > 10) break;
      } while (usedOrderItemIds.has(orderItem.id));
      if (orderItem && usedOrderItemIds.has(orderItem.id)) {
        orderItem = null;
      }
    }

    // Product: nếu có orderItem thì dùng productId từ orderItem
    const product =
      orderItem && orderItem.productId
        ? (products.find((p) => p.id === orderItem.productId) ??
          faker.helpers.arrayElement(products))
        : faker.helpers.arrayElement(products);

    const key = `${user.id}_${product.id}_${orderItem ? orderItem.id : 'null'}`;
    if (usedReviewKeys.has(key)) continue;

    // Đánh dấu đã dùng
    usedReviewKeys.add(key);
    if (orderItem) usedOrderItemIds.add(orderItem.id);

    reviewsData.push({
      id: faker.string.uuid(),
      productId: product.id,
      userId: user.id,
      orderItemId: orderItem ? orderItem.id : null,
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.helpers.maybe(() => faker.commerce.productAdjective(), {
        probability: 0.6,
      }),
      body: faker.lorem.sentences({ min: 1, max: 3 }),
      likes: faker.number.int({ min: 0, max: 200 }),
      images: faker.helpers.maybe(
        () => [
          `https://placehold.co/600x600?text=Review+${faker.string.alpha(3).toUpperCase()}`,
        ],
        { probability: 0.25 }
      ),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
    });
  }

  // ✅ createMany (nhanh, an toàn, không vi phạm unique)
  await prisma.review.createMany({
    data: reviewsData.map((r) => ({
      id: r.id,
      productId: r.productId,
      userId: r.userId,
      orderItemId: r.orderItemId,
      rating: r.rating,
      title: r.title,
      body: r.body,
      likes: r.likes,
      images: r.images,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
    skipDuplicates: true, // tránh lỗi nếu chạy lại seed
  });

  console.log(`✅ Created ${reviewsData.length} reviews`);

  console.log('🧮 Đang cập nhật ratingAvg và ratingCount cho từng product...');

  const ratingStats = await prisma.review.groupBy({
    by: ['productId'],
    _avg: { rating: true },
    _count: { rating: true },
  });

  for (const stat of ratingStats) {
    await prisma.product.update({
      where: { id: stat.productId },
      data: {
        ratingAvg: new Prisma.Decimal(stat._avg.rating?.toFixed(1) || 0),
        ratingCount: stat._count.rating,
      },
    });
  }

  console.log(`✅ Đã cập nhật rating cho ${ratingStats.length} products`);

  // ------------------------
  // 8️⃣ PRODUCT QUESTIONS
  // ------------------------

  const productQuestions = await Promise.all(
    Array.from({ length: 25 }).map(async () => {
      const product = faker.helpers.arrayElement(products);
      const user = faker.helpers.arrayElement(users);
      const hasAnswer = faker.datatype.boolean({ probability: 0.6 }); // 60% có trả lời

      return prisma.productQuestion.create({
        data: {
          product: { connect: { id: product.id } },
          user: { connect: { id: user.id } },
          body: faker.helpers.arrayElement([
            'Does this come with a warranty?',
            'Is this compatible with iPhone 15?',
            'How long is the battery life?',
            'Does it support wireless charging?',
            'Is this available in black color?',
            'Can I return it if it doesn’t fit?',
          ]),
          ...(hasAnswer
            ? {
                answer: faker.helpers.arrayElement([
                  'Yes, it comes with a 12-month warranty.',
                  'It works perfectly with iPhone 15.',
                  'Battery lasts about 10 hours with normal use.',
                  'Yes, it supports Qi wireless charging.',
                  'Currently, only white and silver colors are available.',
                  'Yes, returns are accepted within 7 days of purchase.',
                ]),
                answeredAt: faker.date.recent({ days: 30 }),
              }
            : {}),
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    })
  );

  console.log(`✅ Created ${productQuestions.length} product questions`);

  // ------------------------
  // 8️⃣ VOUCHERS
  // ------------------------

  const vouchers = await Promise.all(
    Array.from({ length: 200 }).map(async () => {
      const type = faker.helpers.arrayElement(Object.values(VoucherType));
      const shop = faker.helpers.maybe(
        () => faker.helpers.arrayElement(shops),
        { probability: 0.6 }
      ); // 60% gắn shop
      const startAt = faker.date.recent({ days: 15 });
      const endAt = faker.date.soon({
        days: faker.number.int({ min: 15, max: 45 }),
        refDate: startAt,
      });

      // Tính giá trị voucher theo loại
      let value;
      switch (type) {
        case 'PERCENT':
          value = faker.number.int({ min: 5, max: 50 }); // %
          break;
        case 'FIXED':
        case 'SHIPPING':
          value = faker.number.int({ min: 50000, max: 500000 }); // VND
          break;
        default:
          value = 0;
      }

      return prisma.voucher.create({
        data: {
          code: `VC-${faker.string.alphanumeric(8).toUpperCase()}`,
          type,
          value,
          maxDiscount: faker.helpers.maybe(() =>
            faker.number.int({ min: 100000, max: 300000 })
          ),
          minSubtotal: faker.helpers.maybe(
            () => faker.number.int({ min: 100000, max: 500000 }),
            { probability: 0.5 }
          ),
          currency: Currency.VND,
          startAt,
          endAt,
          usageLimit: faker.helpers.maybe(
            () => faker.number.int({ min: 50, max: 300 }),
            { probability: 0.7 }
          ),
          perUserLimit: faker.helpers.maybe(
            () => faker.number.int({ min: 1, max: 5 }),
            { probability: 0.8 }
          ),
          shop: shop ? { connect: { id: shop.id } } : undefined,
          isActive: faker.datatype.boolean({ probability: 0.8 }),
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    })
  );

  console.log(`✅ Created ${vouchers.length} vouchers`);

  // ------------------------
  // 8️⃣ VOUCHER CATEGORIES
  // ------------------------

  const voucherCategories: any[] = [];

  // Mỗi voucher sẽ áp dụng cho 1–3 category ngẫu nhiên
  for (const voucher of vouchers) {
    const selectedCats = faker.helpers.arrayElements(
      categories,
      faker.number.int({ min: 1, max: 3 })
    );

    for (const cat of selectedCats) {
      voucherCategories.push({
        voucherId: voucher.id,
        categoryId: cat.id,
      });
    }
  }

  // Loại bỏ trùng (nếu có)
  const voucherCategory = Array.from(
    new Map(
      voucherCategories.map((vc) => [`${vc.voucherId}_${vc.categoryId}`, vc])
    ).values()
  );

  await prisma.voucherCategory.createMany({
    data: voucherCategory,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${voucherCategory.length} voucher category`);

  // ------------------------
  // 8️⃣ VOUCHER PRODUCTS
  // ------------------------

  const voucherProducts: any[] = [];

  // Mỗi voucher áp dụng cho 2–4 sản phẩm ngẫu nhiên
  for (const voucher of vouchers) {
    const selectedProducts = faker.helpers.arrayElements(
      products,
      faker.number.int({ min: 2, max: 4 })
    );

    for (const product of selectedProducts) {
      voucherProducts.push({
        voucherId: voucher.id,
        productId: product.id,
      });
    }
  }

  // Loại bỏ trùng nếu có (vì @@id[voucherId, productId])
  const voucherProduct = Array.from(
    new Map(
      voucherProducts.map((vp) => [`${vp.voucherId}_${vp.productId}`, vp])
    ).values()
  );

  await prisma.voucherProduct.createMany({
    data: voucherProduct,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${voucherProduct.length} voucher–product links`);

  // ------------------------
  // 8️⃣ VOUCHER REDENTIONS
  // ------------------------

  const redemptions: any[] = [];

  // Tạo 20 lượt sử dụng voucher ngẫu nhiên
  for (let i = 0; i < 20; i++) {
    const voucher = faker.helpers.arrayElement(vouchers);
    const order = faker.helpers.arrayElement(orders);
    const user = faker.helpers.arrayElement(users);

    redemptions.push({
      voucherId: voucher.id,
      orderId: order.id,
      userId: user.id,
      usedAt: faker.date.recent({ days: 60 }),
    });
  }

  // Loại bỏ trùng cặp (voucherId, orderId, userId)
  const voucherRedemption = Array.from(
    new Map(
      redemptions.map((r) => [`${r.voucherId}_${r.orderId}_${r.userId}`, r])
    ).values()
  );

  await prisma.voucherRedemption.createMany({
    data: voucherRedemption,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${voucherRedemption.length} voucher redemptions`);

  // ------------------------
  // 8️⃣ ORDER VOUCHERS
  // ------------------------

  const orderVouchers: any[] = [];

  // Mỗi đơn hàng có thể áp dụng 0–2 voucher ngẫu nhiên
  for (const order of orders) {
    if (faker.datatype.boolean({ probability: 0.3 })) continue; // 30% đơn không dùng voucher

    const selectedVouchers = faker.helpers.arrayElements(
      vouchers,
      faker.number.int({ min: 1, max: 2 })
    );

    for (const voucher of selectedVouchers) {
      orderVouchers.push({
        orderId: order.id,
        voucherId: voucher.id,
      });
    }
  }

  // Loại bỏ trùng (vì @@id[orderId, voucherId])
  const orderVoucher = Array.from(
    new Map(
      orderVouchers.map((ov) => [`${ov.orderId}_${ov.voucherId}`, ov])
    ).values()
  );

  await prisma.orderVoucher.createMany({
    data: orderVoucher,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${orderVoucher.length} order–voucher links`);

  // ------------------------
  // 9️⃣ CONVERSATIONS & MESSAGES (REALISTIC SCENARIO)
  // ------------------------
  console.log('💬 Seeding Conversations (Order Inquiries & General)...');

  // SCENARIO A: ORDER INQUIRIES
  // Pick 30 orders to have associated conversations
  const ordersForChat = orders.slice(0, 30);

  for (const order of ordersForChat) {
    // 1. Create the Conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: ConversationType.ORDER_INQUIRY,
        status: faker.helpers.arrayElement(Object.values(ConversationStatus)),
        subject: `Inquiry about Order #${order.orderNumber}`,
        orderId: order.id,
        shopId: order.shopId, // The shop receiving the inquiry
        createdAt: faker.date.between({ from: order.placedAt, to: new Date() }),
      },
    });

    // 2. Add Participants: The Buyer (User) and the Seller (Shop)
    // Note: In your schema, ShopMember links User to Shop, but ConversationParticipant links Shop directly.

    // Participant 1: The Buyer
    await prisma.conversationParticipant.create({
      data: {
        conversationId: conversation.id,
        userId: order.userId,
        shopId: null,
        joinedAt: conversation.createdAt,
      },
    });

    // Participant 2: The Shop (represented by the Shop entity)
    if (order.shopId) {
      await prisma.conversationParticipant.create({
        data: {
          conversationId: conversation.id,
          userId: null,
          shopId: order.shopId,
          joinedAt: conversation.createdAt,
        },
      });
    }

    // 3. Generate Messages (Back and Forth)
    const msgCount = faker.number.int({ min: 2, max: 6 });
    let lastMsgTime = conversation.createdAt;

    for (let i = 0; i < msgCount; i++) {
      const isBuyerSender = i % 2 === 0; // Alternate: Buyer -> Shop -> Buyer
      lastMsgTime = faker.date.soon({ refDate: lastMsgTime, days: 1 });

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          type: MessageType.TEXT,
          // If Buyer sends, senderUserId = order.userId. If Shop sends, senderShopId = order.shopId
          senderUserId: isBuyerSender ? order.userId : null,
          senderShopId: isBuyerSender ? null : order.shopId,
          content: isBuyerSender
            ? faker.helpers.arrayElement([
                'When will this be shipped?',
                'Can I change the delivery address?',
                'I haven not received my tracking number yet.',
                'Is this item genuine?',
              ])
            : faker.helpers.arrayElement([
                'We will ship it tomorrow.',
                'Please check your email for updates.',
                'Yes, it is 100% authentic.',
                'Sorry for the delay.',
              ]),
          createdAt: lastMsgTime,
        },
      });
    }
  }

  // SCENARIO B: GENERAL SHOP INQUIRIES (No specific Order)
  // Create 20 random conversations
  for (let i = 0; i < 20; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const randomShop = faker.helpers.arrayElement(shops);

    // 1. Create Conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: ConversationType.GENERAL,
        status: ConversationStatus.OPEN,
        subject: faker.commerce.productName(), // Asking about a product
        shopId: randomShop.id,
        createdAt: faker.date.recent({ days: 60 }),
      },
    });

    // 2. Add Participants
    await prisma.conversationParticipant.create({
      data: {
        conversationId: conversation.id,
        userId: randomUser.id,
      },
    });

    await prisma.conversationParticipant.create({
      data: {
        conversationId: conversation.id,
        shopId: randomShop.id,
      },
    });

    // 3. Create Messages
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderUserId: randomUser.id,
        content: 'Do you have this item in Red color?',
        createdAt: faker.date.soon({
          refDate: new Date(
            new Date(conversation.createdAt).getTime() + 10 * 60 * 1000
          ),
        }),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderShopId: randomShop.id,
        content: 'Hi, unfortunately we are out of stock for Red.',
        createdAt: faker.date.soon({
          refDate: new Date(
            new Date(conversation.createdAt).getTime() + 60 * 60 * 1000
          ),
        }),
      },
    });
  }

  console.log(`✅ Created Conversations and Messages`);
  console.log('🎉 SEED HOÀN TẤT!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
