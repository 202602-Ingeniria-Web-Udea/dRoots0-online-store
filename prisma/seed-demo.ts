import "dotenv/config";
import { Decimal } from "decimal.js";

import { prisma } from "../lib/prisma";

const DEMO_PREFIX = "Demo -";
const BASE_DATE = new Date("2026-11-02T12:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

type Responsible = "admin" | "user";
type MovementType = "INCOMING" | "OUTGOING";
type OrderStatus =
  | "PENDING"
  | "COMPLETED"
  | "PAID"
  | "DELIVERED"
  | "CANCELED"
  | "SHIPPED";
type PaymentMethod = "CREDIT_CARD" | "DEBIT_CARD" | "PAYPAL" | "CASH";
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

type SeedMovement = {
  type: MovementType;
  quantity: string;
  daysAgo: number;
  responsible: Responsible;
};

type SeedMaster = {
  slug: string;
  name: string;
  initialBalance: string;
  movements: SeedMovement[];
};

type SeedCategory = { id: string; name: string; description: string };
type SeedSupplier = { id: string; name: string; description: string };

type SeedProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  cantidad: number;
  codigo: number;
  categoryIds: string[];
  supplierIds: string[];
};

type SeedCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

type SeedOrder = {
  id: string;
  customerIndex: number;
  daysAgo: number;
  status: OrderStatus;
  items: { productId: string; quantity: number; price: number }[];
  payment: { method: PaymentMethod; status: PaymentStatus };
};

const day = (daysAgo: number) => new Date(BASE_DATE.getTime() - daysAgo * DAY_MS);
const round = (value: number) => Math.round(value * 100) / 100;

const demoMasters: SeedMaster[] = [
  {
    slug: "coffee",
    name: `${DEMO_PREFIX}Organic Coffee Beans 1 kg`,
    initialBalance: "120",
    movements: [
      { type: "INCOMING", quantity: "80", daysAgo: 60, responsible: "admin" },
      { type: "OUTGOING", quantity: "30", daysAgo: 50, responsible: "user" },
      { type: "INCOMING", quantity: "60", daysAgo: 40, responsible: "admin" },
      { type: "OUTGOING", quantity: "45", daysAgo: 30, responsible: "user" },
      { type: "OUTGOING", quantity: "50", daysAgo: 20, responsible: "user" },
      { type: "INCOMING", quantity: "40", daysAgo: 10, responsible: "admin" },
      { type: "OUTGOING", quantity: "35", daysAgo: 5, responsible: "user" },
      { type: "OUTGOING", quantity: "30", daysAgo: 1, responsible: "admin" },
    ],
  },
  {
    slug: "mug",
    name: `${DEMO_PREFIX}Ceramic Mug`,
    initialBalance: "60",
    movements: [
      { type: "INCOMING", quantity: "40", daysAgo: 55, responsible: "admin" },
      { type: "OUTGOING", quantity: "15", daysAgo: 45, responsible: "user" },
      { type: "OUTGOING", quantity: "10", daysAgo: 35, responsible: "user" },
      { type: "INCOMING", quantity: "30", daysAgo: 25, responsible: "admin" },
      { type: "OUTGOING", quantity: "20", daysAgo: 15, responsible: "user" },
      { type: "OUTGOING", quantity: "25", daysAgo: 7, responsible: "user" },
      { type: "INCOMING", quantity: "15", daysAgo: 2, responsible: "admin" },
    ],
  },
  {
    slug: "tote",
    name: `${DEMO_PREFIX}Cotton Tote Bag`,
    initialBalance: "40",
    movements: [
      { type: "INCOMING", quantity: "35", daysAgo: 58, responsible: "admin" },
      { type: "OUTGOING", quantity: "12", daysAgo: 48, responsible: "user" },
      { type: "OUTGOING", quantity: "8", daysAgo: 38, responsible: "user" },
      { type: "INCOMING", quantity: "25", daysAgo: 28, responsible: "admin" },
      { type: "OUTGOING", quantity: "15", daysAgo: 18, responsible: "user" },
      { type: "OUTGOING", quantity: "10", daysAgo: 8, responsible: "user" },
      { type: "INCOMING", quantity: "20", daysAgo: 3, responsible: "admin" },
    ],
  },
  {
    slug: "bottle",
    name: `${DEMO_PREFIX}Stainless Steel Bottle`,
    initialBalance: "80",
    movements: [
      { type: "INCOMING", quantity: "50", daysAgo: 57, responsible: "admin" },
      { type: "OUTGOING", quantity: "20", daysAgo: 47, responsible: "user" },
      { type: "INCOMING", quantity: "40", daysAgo: 37, responsible: "admin" },
      { type: "OUTGOING", quantity: "35", daysAgo: 27, responsible: "user" },
      { type: "OUTGOING", quantity: "25", daysAgo: 17, responsible: "user" },
      { type: "INCOMING", quantity: "30", daysAgo: 9, responsible: "admin" },
      { type: "OUTGOING", quantity: "30", daysAgo: 4, responsible: "user" },
    ],
  },
  {
    slug: "notebook",
    name: `${DEMO_PREFIX}Hardcover Notebook`,
    initialBalance: "100",
    movements: [
      { type: "INCOMING", quantity: "60", daysAgo: 56, responsible: "admin" },
      { type: "OUTGOING", quantity: "25", daysAgo: 46, responsible: "user" },
      { type: "OUTGOING", quantity: "20", daysAgo: 36, responsible: "user" },
      { type: "INCOMING", quantity: "50", daysAgo: 26, responsible: "admin" },
      { type: "OUTGOING", quantity: "40", daysAgo: 16, responsible: "user" },
      { type: "OUTGOING", quantity: "35", daysAgo: 6, responsible: "user" },
      { type: "INCOMING", quantity: "30", daysAgo: 1, responsible: "admin" },
    ],
  },
  {
    slug: "espresso",
    name: `${DEMO_PREFIX}Espresso Blend 500 g`,
    initialBalance: "50",
    movements: [
      { type: "INCOMING", quantity: "30", daysAgo: 54, responsible: "admin" },
      { type: "OUTGOING", quantity: "10", daysAgo: 44, responsible: "user" },
      { type: "INCOMING", quantity: "20", daysAgo: 34, responsible: "admin" },
      { type: "OUTGOING", quantity: "15", daysAgo: 24, responsible: "user" },
      { type: "OUTGOING", quantity: "12", daysAgo: 14, responsible: "user" },
      { type: "OUTGOING", quantity: "18", daysAgo: 4, responsible: "user" },
    ],
  },
];

const categories: SeedCategory[] = [
  { id: "demo-cat-coffee", name: "Coffee", description: "Roasted coffee and beans" },
  {
    id: "demo-cat-drinkware",
    name: "Drinkware",
    description: "Mugs and reusable bottles",
  },
  {
    id: "demo-cat-accessories",
    name: "Accessories",
    description: "Bags and everyday accessories",
  },
  {
    id: "demo-cat-stationery",
    name: "Stationery",
    description: "Notebooks and desk supplies",
  },
];

const suppliers: SeedSupplier[] = [
  {
    id: "demo-sup-andes",
    name: "Andes Coffee Co.",
    description: "Small-batch coffee supplier",
  },
  {
    id: "demo-sup-ceramic",
    name: "Ceramic Studio",
    description: "Handmade drinkware",
  },
  {
    id: "demo-sup-ecotextiles",
    name: "EcoTextiles",
    description: "Sustainable fabric accessories",
  },
  {
    id: "demo-sup-paperhouse",
    name: "PaperHouse",
    description: "Notebooks and stationery",
  },
];

const products: SeedProduct[] = [
  {
    id: "demo-prod-coffee",
    name: "Organic Coffee Beans 1 kg",
    description: "Medium-roast whole-bean coffee",
    price: 24.9,
    cantidad: 110,
    codigo: 1001,
    categoryIds: ["demo-cat-coffee"],
    supplierIds: ["demo-sup-andes"],
  },
  {
    id: "demo-prod-mug",
    name: "Ceramic Mug",
    description: "Stoneware mug with a matte finish",
    price: 14.5,
    cantidad: 75,
    codigo: 1002,
    categoryIds: ["demo-cat-drinkware"],
    supplierIds: ["demo-sup-ceramic"],
  },
  {
    id: "demo-prod-tote",
    name: "Cotton Tote Bag",
    description: "Reusable heavyweight cotton tote",
    price: 18,
    cantidad: 75,
    codigo: 1003,
    categoryIds: ["demo-cat-accessories"],
    supplierIds: ["demo-sup-ecotextiles"],
  },
  {
    id: "demo-prod-bottle",
    name: "Stainless Steel Bottle",
    description: "Insulated 750 ml bottle",
    price: 29.5,
    cantidad: 90,
    codigo: 1004,
    categoryIds: ["demo-cat-drinkware"],
    supplierIds: ["demo-sup-ceramic", "demo-sup-ecotextiles"],
  },
  {
    id: "demo-prod-notebook",
    name: "Hardcover Notebook",
    description: "A5 dotted notebook, 160 pages",
    price: 12,
    cantidad: 120,
    codigo: 1005,
    categoryIds: ["demo-cat-stationery"],
    supplierIds: ["demo-sup-paperhouse"],
  },
  {
    id: "demo-prod-espresso",
    name: "Espresso Blend 500 g",
    description: "Dark-roast espresso blend",
    price: 16.75,
    cantidad: 45,
    codigo: 1006,
    categoryIds: ["demo-cat-coffee"],
    supplierIds: ["demo-sup-andes"],
  },
];

const customers: SeedCustomer[] = [
  {
    id: "demo-cust-1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "+1 555 0101",
    address: "12 Maple Street, Springfield",
  },
  {
    id: "demo-cust-2",
    name: "Bruno Costa",
    email: "bruno.costa@example.com",
    phone: "+1 555 0102",
    address: "48 Oak Avenue, Riverton",
  },
  {
    id: "demo-cust-3",
    name: "Chloe Martin",
    email: "chloe.martin@example.com",
    phone: "+1 555 0103",
    address: "7 Cedar Lane, Lakeside",
  },
  {
    id: "demo-cust-4",
    name: "Daniel Kim",
    email: "daniel.kim@example.com",
    phone: "+1 555 0104",
    address: "91 Birch Road, Fairview",
  },
];

const orders: SeedOrder[] = [
  {
    id: "demo-order-1",
    customerIndex: 0,
    daysAgo: 52,
    status: "DELIVERED",
    items: [
      { productId: "demo-prod-coffee", quantity: 2, price: 24.9 },
      { productId: "demo-prod-mug", quantity: 1, price: 14.5 },
    ],
    payment: { method: "CREDIT_CARD", status: "COMPLETED" },
  },
  {
    id: "demo-order-2",
    customerIndex: 1,
    daysAgo: 43,
    status: "SHIPPED",
    items: [
      { productId: "demo-prod-tote", quantity: 1, price: 18 },
      { productId: "demo-prod-notebook", quantity: 2, price: 12 },
    ],
    payment: { method: "PAYPAL", status: "COMPLETED" },
  },
  {
    id: "demo-order-3",
    customerIndex: 2,
    daysAgo: 31,
    status: "PAID",
    items: [{ productId: "demo-prod-bottle", quantity: 2, price: 29.5 }],
    payment: { method: "DEBIT_CARD", status: "COMPLETED" },
  },
  {
    id: "demo-order-4",
    customerIndex: 3,
    daysAgo: 18,
    status: "PENDING",
    items: [
      { productId: "demo-prod-coffee", quantity: 1, price: 24.9 },
      { productId: "demo-prod-espresso", quantity: 2, price: 16.75 },
    ],
    payment: { method: "CREDIT_CARD", status: "PENDING" },
  },
  {
    id: "demo-order-5",
    customerIndex: 0,
    daysAgo: 9,
    status: "COMPLETED",
    items: [
      { productId: "demo-prod-notebook", quantity: 1, price: 12 },
      { productId: "demo-prod-mug", quantity: 2, price: 14.5 },
    ],
    payment: { method: "CASH", status: "COMPLETED" },
  },
  {
    id: "demo-order-6",
    customerIndex: 1,
    daysAgo: 3,
    status: "CANCELED",
    items: [
      { productId: "demo-prod-tote", quantity: 2, price: 18 },
      { productId: "demo-prod-bottle", quantity: 1, price: 29.5 },
    ],
    payment: { method: "PAYPAL", status: "REFUNDED" },
  },
];

function assertNonNegative(master: SeedMaster) {
  let balance = new Decimal(master.initialBalance);

  for (const movement of [...master.movements].sort(
    (a, b) => b.daysAgo - a.daysAgo
  )) {
    const quantity = new Decimal(movement.quantity);
    balance =
      movement.type === "INCOMING"
        ? balance.plus(quantity)
        : balance.minus(quantity);

    if (balance.isNegative()) {
      throw new Error(
        `${master.name} would have a negative balance at day ${movement.daysAgo}`
      );
    }
  }
}

async function removeBTestData() {
  const masters = await prisma.inventoryMaster.findMany({
    where: { name: { startsWith: "B-test-" } },
    select: { id: true },
  });

  if (masters.length === 0) {
    return;
  }

  const ids = masters.map((master) => master.id);
  await prisma.inventoryMovement.deleteMany({
    where: { masterId: { in: ids } },
  });
  await prisma.inventoryMaster.deleteMany({ where: { id: { in: ids } } });

  console.log(`Removed ${masters.length} B-test master(s) and their movements.`);
}

async function seedInventory(adminId: string, userId: string) {
  for (const master of demoMasters) {
    assertNonNegative(master);

    const saved = await prisma.inventoryMaster.upsert({
      where: { name: master.name },
      update: {
        initialBalance: master.initialBalance,
        createdById: adminId,
      },
      create: {
        name: master.name,
        initialBalance: master.initialBalance,
        createdById: adminId,
      },
      select: { id: true },
    });

    for (const [index, movement] of master.movements.entries()) {
      const id = `demo-mv-${master.slug}-${index + 1}`;
      const responsibleId =
        movement.responsible === "admin" ? adminId : userId;
      const occurredAt = day(movement.daysAgo);

      await prisma.inventoryMovement.upsert({
        where: { id },
        update: {
          masterId: saved.id,
          type: movement.type,
          quantity: movement.quantity,
          occurredAt,
          responsibleId,
        },
        create: {
          id,
          masterId: saved.id,
          type: movement.type,
          quantity: movement.quantity,
          occurredAt,
          responsibleId,
        },
      });
    }
  }
}

async function seedStore() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { name: category.name, description: category.description },
      create: category,
    });
  }

  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { id: supplier.id },
      update: { name: supplier.name, description: supplier.description },
      create: supplier,
    });
  }

  for (const product of products) {
    const categoryConnections = product.categoryIds.map((id) => ({ id }));
    const supplierConnections = product.supplierIds.map((id) => ({ id }));

    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        cantidad: product.cantidad,
        codigo: product.codigo,
        categories: { set: categoryConnections },
        suppliers: { set: supplierConnections },
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        cantidad: product.cantidad,
        codigo: product.codigo,
        categories: { connect: categoryConnections },
        suppliers: { connect: supplierConnections },
      },
    });
  }

  const customerIds: string[] = [];

  for (const customer of customers) {
    const saved = await prisma.customer.upsert({
      where: { email: customer.email },
      update: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        enabled: true,
        deleted: false,
      },
      create: customer,
      select: { id: true },
    });

    customerIds.push(saved.id);
  }

  for (const order of orders) {
    const customerId = customerIds[order.customerIndex];
    if (!customerId) {
      throw new Error(`Missing demo customer at index ${order.customerIndex}`);
    }

    const subtotal = round(
      order.items.reduce((total, item) => total + item.price * item.quantity, 0)
    );
    const tax = round(subtotal * 0.08);
    const total = round(subtotal + tax);
    const orderDate = day(order.daysAgo);

    await prisma.order.upsert({
      where: { id: order.id },
      update: {
        orderDate,
        subTotalAmount: subtotal,
        taxAmount: tax,
        totalAmount: total,
        status: order.status,
        customerId,
      },
      create: {
        id: order.id,
        orderDate,
        subTotalAmount: subtotal,
        taxAmount: tax,
        totalAmount: total,
        status: order.status,
        customerId,
      },
    });

    for (const [index, item] of order.items.entries()) {
      const itemId = `demo-item-${order.id}-${index + 1}`;

      await prisma.orderItem.upsert({
        where: { id: itemId },
        update: {
          quantity: item.quantity,
          price: item.price,
          productId: item.productId,
          orderId: order.id,
        },
        create: {
          id: itemId,
          quantity: item.quantity,
          price: item.price,
          productId: item.productId,
          orderId: order.id,
        },
      });
    }

    await prisma.payment.upsert({
      where: { oderId: order.id },
      update: {
        paymentDate: orderDate,
        amount: total,
        method: order.payment.method,
        status: order.payment.status,
      },
      create: {
        id: `demo-payment-${order.id}`,
        oderId: order.id,
        paymentDate: orderDate,
        amount: total,
        method: order.payment.method,
        status: order.payment.status,
      },
    });
  }
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const userEmail = process.env.SEED_USER_EMAIL ?? "user@example.com";

  const [admin, user] = await Promise.all([
    prisma.user.findUnique({ where: { email: adminEmail }, select: { id: true } }),
    prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } }),
  ]);

  if (!admin || !user) {
    throw new Error(
      "Seed accounts are missing. Run `pnpm run seed` before `pnpm run seed:demo`."
    );
  }

  await removeBTestData();
  await seedInventory(admin.id, user.id);
  await seedStore();

  const [masters, movements, productsCount, customersCount, ordersCount, paymentsCount] =
    await Promise.all([
      prisma.inventoryMaster.count({ where: { name: { startsWith: DEMO_PREFIX } } }),
      prisma.inventoryMovement.count({
        where: { master: { name: { startsWith: DEMO_PREFIX } } },
      }),
      prisma.product.count({ where: { id: { startsWith: "demo-prod-" } } }),
      prisma.customer.count({ where: { id: { startsWith: "demo-cust-" } } }),
      prisma.order.count({ where: { id: { startsWith: "demo-order-" } } }),
      prisma.payment.count({ where: { id: { startsWith: "demo-payment-" } } }),
    ]);

  console.log("Demo data seeded:");
  console.log(
    JSON.stringify(
      {
        masters,
        movements,
        products: productsCount,
        customers: customersCount,
        orders: ordersCount,
        payments: paymentsCount,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
