const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.reference.deleteMany();
  await prisma.edit.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@blackwiki.org',
      name: 'Admin',
      role: 'admin',
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'History',
        description: 'Historical events, figures, and movements',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Culture',
        description: 'Cultural expressions, traditions, and heritage',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Innovation',
        description: 'Scientific and technological achievements',
      },
    }),
  ]);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Civil Rights' } }),
    prisma.tag.create({ data: { name: 'Music' } }),
    prisma.tag.create({ data: { name: 'Science' } }),
    prisma.tag.create({ data: { name: 'Literature' } }),
  ]);

  // Create sample articles
  await prisma.article.create({
    data: {
      title: 'The Harlem Renaissance',
      content: 'The Harlem Renaissance was an intellectual and cultural revival of African American music, dance, art, fashion, literature, theater, and politics centered in Harlem, Manhattan, New York City, spanning the 1920s and 1930s.',
      summary: 'Cultural movement that sparked Black artistic expression',
      slug: 'harlem-renaissance',
      isPublished: true,
      authorId: adminUser.id,
      categories: {
        connect: [
          { id: categories[0].id }, // History
          { id: categories[1].id }, // Culture
        ],
      },
      tags: {
        connect: [
          { id: tags[1].id }, // Music
          { id: tags[3].id }, // Literature
        ],
      },
      references: {
        create: [
          {
            url: 'https://www.history.com/topics/roaring-twenties/harlem-renaissance',
            title: 'The Harlem Renaissance',
            description: 'History.com article on the Harlem Renaissance',
          },
        ],
      },
    },
  });

  await prisma.article.create({
    data: {
      title: 'African American Scientists and Inventors',
      content: 'Throughout history, African American scientists and inventors have made significant contributions to various fields including agriculture, medicine, technology, and space exploration.',
      summary: 'Celebrating Black excellence in science and innovation',
      slug: 'black-scientists-inventors',
      isPublished: true,
      authorId: adminUser.id,
      categories: {
        connect: [
          { id: categories[0].id }, // History
          { id: categories[2].id }, // Innovation
        ],
      },
      tags: {
        connect: [
          { id: tags[2].id }, // Science
        ],
      },
    },
  });

  console.log('Database has been seeded! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
