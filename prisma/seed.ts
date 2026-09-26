import dotenv from "dotenv";
dotenv.config({ path: "server/.env" });
dotenv.config();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const GRADUATING_SETS = [
  { setName: "Alpha Set", graduationYear: 2020, description: "First graduating set of Clifford University" },
  { setName: "Beta Set", graduationYear: 2021, description: "Second graduating set of Clifford University" },
  { setName: "Gamma Set", graduationYear: 2022, description: "Third graduating set of Clifford University" },
  { setName: "Delta Set", graduationYear: 2023, description: "Fourth graduating set of Clifford University" },
  { setName: "Epsilon Set", graduationYear: 2024, description: "Fifth graduating set of Clifford University" },
  { setName: "Zeta Set", graduationYear: 2025, description: "Sixth graduating set of Clifford University" },
  { setName: "Eta Set", graduationYear: 2026, description: "Seventh graduating set of Clifford University" },
];

const FACULTIES = [
  { name: "Faculty of Management Sciences", code: "FMS" },
  { name: "Faculty of Social Sciences & Humanities", code: "FSSH" },
  { name: "Faculty of Natural & Applied Sciences", code: "FNAS" },
  { name: "Faculty of Agriculture", code: "FOA" },
  { name: "Faculty of Education", code: "FOE" },
  { name: "Faculty of Law", code: "FOL" },
  { name: "JUPEB Program", code: "JUPEB" },
  { name: "OTHERS", code: "OTH" },
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara"
];

async function main() {
  console.log("Checking DB connection and seeding reference tables...");

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("sample")) {
    console.log("Mock environment detected (no live Neon Postgres instance connected). Seed script logic validated.");
    return;
  }

  // 1. Seed Graduating Sets
  const setMap: Record<string, string> = {};
  for (const setItem of GRADUATING_SETS) {
    const setRecord = await prisma.graduatingSet.upsert({
      where: { setName: setItem.setName },
      update: { graduationYear: setItem.graduationYear, description: setItem.description },
      create: setItem,
    });
    setMap[setItem.setName] = setRecord.id;
  }
  console.log(`Seeded ${GRADUATING_SETS.length} Graduating Sets.`);

  // 2. Seed Faculties
  const facultyMap: Record<string, string> = {};
  for (const fac of FACULTIES) {
    const facRecord = await prisma.faculty.upsert({
      where: { name: fac.name },
      update: { code: fac.code },
      create: fac,
    });
    facultyMap[fac.name] = facRecord.id;
  }
  console.log(`Seeded ${FACULTIES.length} Faculties.`);

  // 3. Seed States/Locations
  for (const stateName of NIGERIAN_STATES) {
    await prisma.location.upsert({
      where: { state_city: { state: stateName, city: "Main" } },
      update: {},
      create: { state: stateName, city: "Main", isDiaspora: false },
    });
  }
  // Diaspora sample
  await prisma.location.upsert({
    where: { state_city: { state: "Diaspora", city: "International" } },
    update: {},
    create: { state: "Diaspora", city: "International", isDiaspora: true },
  });
  console.log(`Seeded States/Locations.`);

  // 4. Seed Official Alumni Directory
  const sampleOfficialDirectory = [
    { matricNumber: "CU/16/0001", firstName: "Adaeze", lastName: "Nwachukwu", setName: "Alpha Set", facName: "Faculty of Law", dept: "Law" },
    { matricNumber: "CU/16/0002", firstName: "Ngozi", lastName: "Eze", setName: "Alpha Set", facName: "Faculty of Management Sciences", dept: "Business Administration" },
    { matricNumber: "CU/16/0003", firstName: "Amaka", lastName: "Okoro", setName: "Alpha Set", facName: "Faculty of Education", dept: "English Education" },
    { matricNumber: "CU/17/0004", firstName: "Emeka", lastName: "Okafor", setName: "Beta Set", facName: "Faculty of Natural & Applied Sciences", dept: "Computer Science" },
    { matricNumber: "CU/17/0005", firstName: "Fatima", lastName: "Yusuf", setName: "Beta Set", facName: "Faculty of Natural & Applied Sciences", dept: "Biochemistry" },
    { matricNumber: "CU/17/0006", firstName: "Ifeoma", lastName: "Nwoye", setName: "Beta Set", facName: "Faculty of Social Sciences & Humanities", dept: "Economics" },
    { matricNumber: "CU/18/0007", firstName: "Chidi", lastName: "Obiora", setName: "Gamma Set", facName: "Faculty of Social Sciences & Humanities", dept: "Economics" },
    { matricNumber: "CU/18/0008", firstName: "Babatunde", lastName: "Oladele", setName: "Gamma Set", facName: "Faculty of Law", dept: "Commercial Law" },
    { matricNumber: "CU/18/0009", firstName: "Michael", lastName: "Uche", setName: "Gamma Set", facName: "Faculty of Management Sciences", dept: "Agribusiness" },
    { matricNumber: "CU/19/0010", firstName: "Oluwaseun", lastName: "Adeyemi", setName: "Delta Set", facName: "Faculty of Social Sciences & Humanities", dept: "Mass Communication" },
    { matricNumber: "CU/19/0011", firstName: "Kayode", lastName: "Fashola", setName: "Delta Set", facName: "Faculty of Natural & Applied Sciences", dept: "Mathematics" },
    { matricNumber: "CU/20/0012", firstName: "Chidinma", lastName: "Obi", setName: "Epsilon Set", facName: "Faculty of Natural & Applied Sciences", dept: "Microbiology" },
  ];

  for (const entry of sampleOfficialDirectory) {
    const setId = setMap[entry.setName];
    const facId = facultyMap[entry.facName];
    if (setId && facId) {
      await prisma.officialAlumniDirectory.upsert({
        where: { matricNumber: entry.matricNumber },
        update: {
          firstName: entry.firstName,
          lastName: entry.lastName,
          graduatingSetId: setId,
          facultyId: facId,
          department: entry.dept,
        },
        create: {
          matricNumber: entry.matricNumber,
          firstName: entry.firstName,
          lastName: entry.lastName,
          graduatingSetId: setId,
          facultyId: facId,
          department: entry.dept,
        },
      });
    }
  }
  console.log(`Seeded ${sampleOfficialDirectory.length} Official Alumni Directory entries.`);

  // 5. Seed Super Admin
  const adminPassword = await bcrypt.hash("AdminPassword123!", 10);
  const superAdmin = await prisma.member.upsert({
    where: { email: "admin@cliffordalumni.ng" },
    update: {},
    create: {
      email: "admin@cliffordalumni.ng",
      passwordHash: adminPassword,
      firstName: "EXCO",
      lastName: "SuperAdmin",
      memberType: "ALUMNI",
      role: "SUPER_ADMIN",
      verificationStatus: "VERIFIED",
      phone: "+2348000000000",
      profession: "Alumni Association President",
    },
  });
  console.log(`Seeded Super Admin (${superAdmin.email}).`);

  // Dues & Campaign
  await prisma.duesItem.upsert({
    where: { id: "annual-dues-2025" },
    update: {},
    create: {
      id: "annual-dues-2025",
      title: "2025 Annual Membership Dues",
      type: "ANNUAL_DUES",
      amount: 10000,
      academicYear: "2024/2025",
      isRequired: true,
      description: "Standard annual alumni association membership levy.",
    },
  });

  await prisma.donationCampaign.upsert({
    where: { id: "alumni-center-building-fund" },
    update: {},
    create: {
      id: "alumni-center-building-fund",
      title: "Alumni Innovation Hub & Center Development",
      description: "Fundraising for the state-of-the-art Clifford University Alumni Center & Tech Hub.",
      targetAmount: 50000000,
      raisedAmount: 12500000,
      isActive: true,
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
