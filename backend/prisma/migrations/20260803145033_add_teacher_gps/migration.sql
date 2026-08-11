-- AlterTable
ALTER TABLE "AttendanceSession" ADD COLUMN     "allowedRadius" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "collegeLatitude" DOUBLE PRECISION,
ADD COLUMN     "collegeLongitude" DOUBLE PRECISION;
