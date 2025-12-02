import { prisma } from '@/lib/db';
import { faker } from '@faker-js/faker';
import { $Enums, Currency } from '@/lib/generated/prisma';
import OrderStatus = $Enums.OrderStatus;
import PaymentStatus = $Enums.PaymentStatus;
import FulfillmentStatus = $Enums.FulfillmentStatus;

export async function seedOrdersForSeller(sellerId: string) {
  console.log(`📉 Seeding demo orders for seller: ${sellerId}`);

  // 1. Get Seller's Shop
  const shop = await prisma.shop.findFirst({
    where: { ownerId: sellerId },
    include: { products: { include: { variants: true } } },
  });

  if (!shop) {
    console.error('Shop not found for this seller');
    return;
  }

  if (shop.products.length === 0) {
    console.error('Shop has no products');
    return;
  }

  // 2. Get some buyers (excluding the seller)
  const buyers = await prisma.user.findMany({
    take: 50,
    where: { id: { not: sellerId } },
  });

  const ordersToCreate = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1); // 1 year ago

  // 3. Loop through every day from 1 year ago to today
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Generate a random number of orders per day (0 to 5)
    // You can adjust 'probability' to create gaps or spikes
    const dailyOrderCount = faker.helpers.maybe(
      () => faker.number.int({ min: 1, max: 6 }),
      { probability: 0.4 } // 40% chance of having orders on a given day
    ) || 0;

    for (let i = 0; i < dailyOrderCount; i++) {
      const buyer = faker.helpers.arrayElement(buyers);

      // Pick 1-4 random products
      const numItems = faker.number.int({ min: 1, max: 4 });
      const itemsData = [];
      let itemsTotal = 0;

      for (let k = 0; k < numItems; k++) {
        const product = faker.helpers.arrayElement(shop.products);
        const variant = faker.helpers.arrayElement(product.variants);
        if (!variant) continue;

        const quantity = faker.number.int({ min: 1, max: 3 });
        const price = Number(variant.price);
        const total = price * quantity;
        itemsTotal += total;

        itemsData.push({
          productId: product.id,
          variantId: variant.id,
          title: product.title,
          unitPrice: price,
          quantity,
          total,
        });
      }

      if (itemsData.length === 0) continue;

      const shippingFee = faker.number.int({ min: 15000, max: 50000 });
      const discountTotal = faker.number.int({ min: 0, max: 20000 });
      const taxTotal = Math.round(itemsTotal * 0.08);
      const grandTotal = itemsTotal + shippingFee + taxTotal - discountTotal;

      // Set time to random hour during the day
      const orderDate = new Date(d);
      orderDate.setHours(faker.number.int({min:8, max:22}), faker.number.int({min:0, max:59}));

      ordersToCreate.push({
        id: faker.string.uuid(),
        orderNumber: `DEMO-${orderDate.getTime()}-${i}`,
        userId: buyer.id,
        shopId: shop.id,
        status: OrderStatus.DELIVERED, // Mostly delivered for past stats
        paymentStatus: PaymentStatus.PAID,
        fulfillmentStatus: FulfillmentStatus.FULFILLED,
        currency: Currency.VND,
        itemsTotal,
        shippingFee,
        discountTotal,
        taxTotal,
        grandTotal,
        shippingAddress: {
          name: buyer.name,
          address: faker.location.streetAddress(),
          city: faker.location.city()
        },
        placedAt: orderDate,
        items: {
          create: itemsData.map(item => ({
            product: { connect: { id: item.productId } },
            variant: { connect: { id: item.variantId } },
            title: item.title,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            total: item.total
          }))
        }
      });
    }
  }

  console.log(`Creating ${ordersToCreate.length} historical orders for demonstration...`);

  // Execute sequentially to avoid overloading DB connections with complex nested creates
  for (const data of ordersToCreate) {
    await prisma.order.create({ data });
  }

  console.log(`✅ Finished seeding demo orders for ${sellerId}`);
}

seedOrdersForSeller('d1476c1d-488f-4a87-9ece-2f2e46d104cc');