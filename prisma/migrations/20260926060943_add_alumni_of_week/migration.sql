-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "alumniOfWeekBio" TEXT,
ADD COLUMN     "isAlumniOfWeek" BOOLEAN NOT NULL DEFAULT false;
