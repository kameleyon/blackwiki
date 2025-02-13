const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@blackwiki.com' },
    update: {},
    create: {
      email: 'admin@blackwiki.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log({ admin });

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'user@blackwiki.com' },
    update: {},
    create: {
      email: 'user@blackwiki.com',
      name: 'Test User',
      password: userPassword,
      role: 'user',
    },
  });

  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
