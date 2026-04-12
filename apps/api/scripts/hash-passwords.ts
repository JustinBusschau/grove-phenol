import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPasswords() {
  console.log('Updating user passwords with proper hashes...');

  const users = await prisma.user.findMany();

  for (const user of users) {
    const newPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    });

    console.log(`Updated password for user: ${user.email}`);
  }

  console.log('Password hashing completed!');
}

hashPasswords()
  .catch((e) => {
    console.error('Error during password hashing:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
