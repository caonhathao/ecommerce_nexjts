import { PrismaClient } from "../lib/generated/prisma";
const prisma = new PrismaClient();

async function main() {
  //seed categories
  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
      position: 1,
      children: {
        create: [
          {
            name: "Phones",
            slug: "phones",
            position: 1,
          },
          {
            name: "Laptops",
            slug: "laptops",
            position: 2,
          },
        ],
      },
    },
    include: { children: true },
  });

  const books = await prisma.category.create({
    data: {
      name: "Books",
        slug: "books",
        position: 2,
        children: {
            create: [
                {
                    name: "Fiction",
                    slug: "fiction",
                    position: 1,
                },
                {
                    name: "Non-Fiction",
                    slug: "non-fiction",
                    position: 2,
                },
            ],
        },
    },
    include: { children: true },
    });

    //seed users
;


  console.log("✅ Seed data completed!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
