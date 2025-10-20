import { PrismaClient } from '@/lib/generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Đang xóa dữ liệu cũ...');
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  console.log('🚀 Bắt đầu seed dữ liệu...');

  // ------------------------
  // 1️⃣ USERS
  // ------------------------
  const users = await Promise.all(
    Array.from({ length: 5 }).map(() =>
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
  // 2️⃣ SHOPS
  // ------------------------
  const shops = await Promise.all(
    users.slice(0, 3).map((user) =>
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
  // 3️⃣ CATEGORIES
  // ------------------------
  const categories = await Promise.all(
    Array.from({ length: 5 }).map(() => {
      const name = faker.commerce.department();
      const slug = faker.helpers.slugify(name.toLowerCase());
      const uniqueSlug = `${slug}-${faker.string.alphanumeric(6).toLowerCase()}`;

      return prisma.category.create({
        data: {
          name,
          slug: uniqueSlug,
          position: faker.number.int({ min: 1, max: 10 }),
        },
      });
    })
  );

  console.log(`✅ Created ${categories.length} categories`);

  // ------------------------
  // 4️⃣ PRODUCTS
  // ------------------------
  const products = await Promise.all(
    Array.from({ length: 10 }).map(() => {
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
          minPrice,
          maxPrice,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
        },
      });
    })
  );

  console.log(`✅ Created ${products.length} products`);

  // ------------------------
  // 5️⃣ PRODUCT VARIANTS
  // ------------------------
  const variants: { id: string; price: any }[] = [];

  for (const product of products) {
    for (let i = 0; i < 2; i++) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: faker.string.alphanumeric(8),
          name: faker.commerce.productMaterial(),
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
  // 6️⃣ PRODUCT IMAGES
  // ------------------------
  const images = await Promise.all(
    products.flatMap((product) =>
      Array.from({ length: 2 }).map(() =>
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
      const selectedVariants = faker.helpers.arrayElements(variants, 2);
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
