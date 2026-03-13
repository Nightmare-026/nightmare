import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed fixed categories
  const categories = [
    {
      name: 'Class 1-8',
      slug: 'class-1-8',
      icon: '📚',
      description: 'Educational resources for primary school students (Classes 1-8)',
      displayOrder: 1,
    },
    {
      name: 'Class 9-10',
      slug: 'class-9-10',
      icon: '🎓',
      description: 'Study materials for secondary school students (Classes 9-10)',
      displayOrder: 2,
    },
    {
      name: 'Polytechnic (CSE)',
      slug: 'polytechnic-cse',
      icon: '💻',
      description: 'Computer Science & Engineering polytechnic resources',
      displayOrder: 3,
    },
    {
      name: 'Polytechnic (EE)',
      slug: 'polytechnic-ee',
      icon: '⚡',
      description: 'Electrical Engineering polytechnic resources',
      displayOrder: 4,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Seeded 4 fixed categories');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
