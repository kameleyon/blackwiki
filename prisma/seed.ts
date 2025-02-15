const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Define categories with descriptions
  const categories = [
    {
      name: "History",
      description: "Historical events, periods, movements, and figures in Black history",
    },
    {
      name: "Civil Rights",
      description: "Civil rights movements, leaders, organizations, and achievements",
    },
    {
      name: "Culture",
      description: "Cultural traditions, customs, practices, and celebrations",
    },
    {
      name: "Arts",
      description: "Visual arts, painting, sculpture, photography, and artistic movements",
    },
    {
      name: "Music",
      description: "Musical genres, artists, instruments, and traditions",
    },
    {
      name: "Literature",
      description: "Literary works, authors, poetry, and written traditions",
    },
    {
      name: "Science",
      description: "Scientific achievements, discoveries, and notable scientists",
    },
    {
      name: "Technology",
      description: "Technological innovations, inventions, and digital culture",
    },
    {
      name: "Education",
      description: "Educational institutions, practices, leaders, and achievements",
    },
    {
      name: "Politics",
      description: "Political movements, leaders, organizations, and policies",
    },
    {
      name: "Business",
      description: "Business leaders, enterprises, entrepreneurship, and economic development",
    },
    {
      name: "Sports",
      description: "Athletes, teams, sports history, and achievements",
    },
    {
      name: "Religion",
      description: "Religious practices, traditions, institutions, and spiritual leaders",
    },
    {
      name: "Philosophy",
      description: "Philosophical thought, thinkers, and intellectual traditions",
    },
    {
      name: "Food",
      description: "Culinary traditions, dishes, cooking methods, and food culture",
    },
    {
      name: "Fashion",
      description: "Fashion history, designers, styles, and clothing traditions",
    },
    {
      name: "Language",
      description: "Languages, dialects, linguistics, and communication traditions",
    },
    {
      name: "Media",
      description: "Film, television, radio, journalism, and digital media",
    },
    {
      name: "Dance",
      description: "Dance forms, choreographers, performers, and traditions",
    },
    {
      name: "Theater",
      description: "Theater productions, playwrights, actors, and performance traditions",
    },
    {
      name: "Architecture",
      description: "Architectural styles, buildings, architects, and design traditions",
    },
    {
      name: "Health",
      description: "Healthcare, medicine, wellness practices, and medical achievements",
    },
    {
      name: "Environment",
      description: "Environmental practices, conservation, and relationships with nature",
    },
    {
      name: "Social Justice",
      description: "Social movements, activism, advocacy, and justice initiatives",
    },
    {
      name: "Military",
      description: "Military service, veterans, units, and wartime contributions",
    },
    {
      name: "Law",
      description: "Legal history, landmark cases, lawyers, and justice system",
    },
    {
      name: "Geography",
      description: "Geographic regions, communities, migration, and spatial relations",
    },
    {
      name: "Anthropology",
      description: "Cultural anthropology, archaeology, and ethnographic studies",
    },
    {
      name: "Psychology",
      description: "Psychological research, mental health, and behavioral studies",
    },
    {
      name: "Economics",
      description: "Economic systems, development, trade, and financial history",
    }
  ];

  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: {
        name: category.name,
        description: category.description,
      },
    });
  }

  console.log('Categories seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
