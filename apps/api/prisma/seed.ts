import { PrismaClient, RoleName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: {
      name: RoleName.ADMIN,
      description: 'System administrator with full access',
    },
  });

  const clinicianRole = await prisma.role.upsert({
    where: { name: RoleName.CLINICIAN },
    update: {},
    create: {
      name: RoleName.CLINICIAN,
      description: 'Healthcare professional who manages medications and checklists',
    },
  });

  console.log('Roles created:', { adminRole, clinicianRole });

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@phenol.local' },
    update: {},
    create: {
      email: 'admin@phenol.local',
      firstName: 'System',
      lastName: 'Administrator',
      password: 'admin123', // Will be hashed in auth service
      roleId: adminRole.id,
    },
  });

  // Create clinician user
  const clinicianUser = await prisma.user.upsert({
    where: { email: 'clinician@phenol.local' },
    update: {},
    create: {
      email: 'clinician@phenol.local',
      firstName: 'Dr. Jane',
      lastName: 'Smith',
      password: 'clinician123', // Will be hashed in auth service
      roleId: clinicianRole.id,
    },
  });

  console.log('Users created:', { adminUser, clinicianUser });

  // Create sample medications
  const medications = [
    {
      name: 'Epinephrine',
      description: 'Emergency cardiac medication',
      concentration: '1 mg/mL',
      unit: 'mg',
    },
    {
      name: 'Dopamine',
      description: 'Inotropic support medication',
      concentration: '400 mg/250 mL',
      unit: 'mcg/kg/min',
    },
    {
      name: 'Norepinephrine',
      description: 'Vasopressor for hypotension',
      concentration: '8 mg/250 mL',
      unit: 'mcg/min',
    },
    {
      name: 'Insulin',
      description: 'Blood glucose management',
      concentration: '100 units/mL',
      unit: 'units/hour',
    },
  ];

  for (const med of medications) {
    const existingMed = await prisma.medication.findFirst({
      where: { name: med.name }
    });
    
    if (!existingMed) {
      await prisma.medication.create({
        data: med,
      });
    }
  }

  console.log('Sample medications created');

  // Create sample checklist steps template
  const checklistSteps = [
    {
      title: 'Verify Patient Identity',
      description: 'Confirm patient name, date of birth, and medical record number',
      order: 1,
    },
    {
      title: 'Review Medication Order',
      description: 'Verify medication, dose, route, and frequency against provider orders',
      order: 2,
    },
    {
      title: 'Check Allergies',
      description: 'Review patient allergies and medication interactions',
      order: 3,
    },
    {
      title: 'Prepare Equipment',
      description: 'Gather infusion pump, IV tubing, and medication',
      order: 4,
    },
    {
      title: 'Calculate Dose',
      description: 'Verify dosage calculations and concentration',
      order: 5,
    },
    {
      title: 'Label Infusion',
      description: 'Apply medication label with all required information',
      order: 6,
    },
    {
      title: 'Prime Tubing',
      description: 'Prime IV tubing and remove air bubbles',
      order: 7,
    },
    {
      title: 'Connect to Patient',
      description: 'Establish IV access and connect infusion',
      order: 8,
    },
    {
      title: 'Set Pump Parameters',
      description: 'Program infusion pump with correct rate and dose',
      order: 9,
    },
    {
      title: 'Start Infusion',
      description: 'Begin infusion and document start time',
      order: 10,
    },
  ];

  for (const step of checklistSteps) {
    const existingStep = await prisma.checklistStep.findFirst({
      where: { 
        title: step.title,
        checklistId: null,
      }
    });
    
    if (!existingStep) {
      await prisma.checklistStep.create({
        data: step,
      });
    }
  }

  console.log('Checklist steps template created');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
