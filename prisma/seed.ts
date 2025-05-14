import { PrismaClient, OrderType, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Menu items with realistic prices
const menuItems = [
  { name: 'Margherita Pizza', price: 12.99 },
  { name: 'Pepperoni Pizza', price: 14.99 },
  { name: 'Vegetarian Pizza', price: 13.99 },
  { name: 'Caesar Salad', price: 8.99 },
  { name: 'Greek Salad', price: 9.99 },
  { name: 'Chicken Wings (8pcs)', price: 11.99 },
  { name: 'Garlic Bread', price: 4.99 },
  { name: 'Spaghetti Carbonara', price: 15.99 },
  { name: 'Fettuccine Alfredo', price: 14.99 },
  { name: 'Grilled Salmon', price: 22.99 },
  { name: 'Chicken Parmesan', price: 17.99 },
  { name: 'Tiramisu', price: 7.99 },
  { name: 'Cheesecake', price: 6.99 },
  { name: 'Soft Drinks', price: 2.99 },
  { name: 'House Wine (Glass)', price: 8.99 },
];

// Common special instructions
const specialInstructions = [
  'Extra spicy',
  'No onions',
  'Gluten-free if possible',
  'Extra cheese',
  'Well done',
  'Dressing on the side',
  'No garlic',
  'Extra sauce',
];

// Preparation notes templates
const preparationNotes = [
  'Allergy alert: Customer has nut allergy',
  'Regular customer - likes extra sauce',
  'VIP customer',
  'Birthday celebration',
  'Rush order',
  'Corporate order - needs proper presentation',
];

/**
 * Generates a random order with realistic data
 * @returns A complete order object ready for database insertion
 */
function generateOrder() {
  // Generate basic customer info
  const customerName = faker.person.fullName();
  const customerEmail = faker.internet.email();
  
  // Randomly select order type
  const orderType = faker.helpers.arrayElement(Object.values(OrderType));
  
  // Generate between 1 and 5 items for the order
  const numberOfItems = faker.number.int({ min: 1, max: 5 });
  const items = Array.from({ length: numberOfItems }, () => {
    const menuItem = faker.helpers.arrayElement(menuItems);
    return {
      name: menuItem.name,
      price: menuItem.price,
      quantity: faker.number.int({ min: 1, max: 4 }),
      specialInstructions: faker.helpers.maybe(() => faker.helpers.arrayElement(specialInstructions), { probability: 0.3 })
    };
  });

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Generate dates
  const createdAt = faker.date.past({ years: 0.5 }); // Orders from last 6 months
  const scheduledFor = orderType === 'pickup' || orderType === 'delivery' 
    ? faker.helpers.maybe(() => faker.date.future({ years: 0.1, refDate: createdAt }), { probability: 0.4 })
    : null;

  // Generate order status based on dates
  let status: OrderStatus;
  const now = new Date();
  if (scheduledFor && scheduledFor > now) {
    status = OrderStatus.pending;
  } else {
    status = faker.helpers.arrayElement([
      OrderStatus.completed,
      OrderStatus.confirmed,
      OrderStatus.delivered,
      OrderStatus.ready
    ]);
  }

  return {
    customerName,
    customerEmail,
    orderType,
    status,
    total,
    scheduledFor,
    preparationNotes: faker.helpers.maybe(() => faker.helpers.arrayElement(preparationNotes), { probability: 0.3 }),
    items,
    createdAt,
  };
}

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  console.log('🗑️  Cleared existing data');

  // Generate 50 orders
  const orders = Array.from({ length: 50 }, generateOrder);

  // Sort orders by creation date
  orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // Insert orders
  for (const [index, orderData] of orders.entries()) {
    const { items, ...orderInfo } = orderData;
    const order = await prisma.order.create({
      data: {
        ...orderInfo,
        items: {
          create: items
        }
      },
      include: {
        items: true
      }
    });
    console.log(`📦 Created order ${index + 1}/50: ${order.id}`);
  }

  console.log('✅ Seeding completed successfully!');
}

// Execute seeding
main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 