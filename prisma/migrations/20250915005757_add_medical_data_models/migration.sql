/*
  Warnings:

  - The values [PROCESSED] on the enum `PayoutStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `endTime` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `netAmount` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `paypalEmail` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `platformFee` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `processedBy` on the `Payout` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[availabilityId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `CreditTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('PENDING', 'URGENT', 'IN_PROGRESS', 'CONSULTATION', 'CONSULTATION_COMPLETED', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('CONNECTING', 'CONNECTED', 'ON_HOLD', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('VIDEO', 'AUDIO', 'CHAT');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ConsultationType" AS ENUM ('REGULAR', 'EMERGENCY', 'FOLLOW_UP', 'CONSULTATION');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMERGENCY_ALERT', 'EMERGENCY_CALL', 'APPOINTMENT_REMINDER', 'CONSULTATION_REQUEST', 'SYSTEM_NOTIFICATION', 'PAYMENT_UPDATE');

-- AlterEnum
BEGIN;
CREATE TYPE "PayoutStatus_new" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
ALTER TABLE "Payout" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payout" ALTER COLUMN "status" TYPE "PayoutStatus_new" USING ("status"::text::"PayoutStatus_new");
ALTER TYPE "PayoutStatus" RENAME TO "PayoutStatus_old";
ALTER TYPE "PayoutStatus_new" RENAME TO "PayoutStatus";
DROP TYPE "PayoutStatus_old";
ALTER TABLE "Payout" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
ALTER TYPE "VerificationStatus" ADD VALUE 'UNDER_REVIEW';

-- DropIndex
DROP INDEX "Appointment_doctorId_startTime_idx";

-- DropIndex
DROP INDEX "Appointment_status_startTime_idx";

-- DropIndex
DROP INDEX "Payout_doctorId_status_idx";

-- DropIndex
DROP INDEX "Payout_status_createdAt_idx";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "availabilityId" TEXT;

-- AlterTable
ALTER TABLE "CreditTransaction" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payout" DROP COLUMN "credits",
DROP COLUMN "netAmount",
DROP COLUMN "paypalEmail",
DROP COLUMN "platformFee",
DROP COLUMN "processedAt",
DROP COLUMN "processedBy",
ADD COLUMN     "stripePayoutId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "consultationFee" DOUBLE PRECISION,
ADD COLUMN     "experienceCertUrl" TEXT,
ADD COLUMN     "identityProofUrl" TEXT,
ADD COLUMN     "isEmergencyDoctor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "medicalDegree" TEXT,
ADD COLUMN     "medicalDegreeUrl" TEXT,
ADD COLUMN     "medicalLicenseUrl" TEXT,
ADD COLUMN     "responseTime" TEXT,
ADD COLUMN     "verificationNotes" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT,
ADD COLUMN     "workingHospital" TEXT,
ALTER COLUMN "credits" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "EmergencyCase" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "symptoms" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "patientInfo" TEXT NOT NULL,
    "emergencyScore" INTEGER NOT NULL DEFAULT 0,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "status" "EmergencyStatus" NOT NULL DEFAULT 'PENDING',
    "assignedDoctorId" TEXT,
    "kycVerificationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyCall" (
    "id" TEXT NOT NULL,
    "emergencyId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT,
    "callType" "CallType" NOT NULL DEFAULT 'VIDEO',
    "roomName" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'CONNECTING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "endReason" TEXT,
    "recordingUrl" TEXT,

    CONSTRAINT "EmergencyCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "patientInfo" TEXT NOT NULL,
    "aadharNumber" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "insuranceNumber" TEXT,
    "verificationStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "verificationFee" DOUBLE PRECISION NOT NULL DEFAULT 1.00,
    "paymentIntentId" TEXT,
    "verificationDetails" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "emergencyId" TEXT,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT,
    "type" "ConsultationType" NOT NULL DEFAULT 'REGULAR',
    "duration" INTEGER,
    "summary" TEXT,
    "diagnosis" TEXT,
    "prescription" TEXT,
    "followUpDate" TIMESTAMP(3),
    "status" "ConsultationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT,
    "patientId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthMeasurement" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "patientId" TEXT,
    "appointmentId" TEXT,
    "heartRate" INTEGER NOT NULL DEFAULT 0,
    "heartRateVariability" INTEGER NOT NULL DEFAULT 0,
    "respiratoryRate" INTEGER NOT NULL DEFAULT 0,
    "stressLevel" INTEGER NOT NULL DEFAULT 0,
    "systolicBP" INTEGER NOT NULL DEFAULT 0,
    "diastolicBP" INTEGER NOT NULL DEFAULT 0,
    "oxygenSaturation" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthAlert" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "patientId" TEXT,
    "appointmentId" TEXT,
    "alertType" TEXT NOT NULL,
    "alertData" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "vitalsSnapshot" TEXT,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "doctorResponse" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalDiagnosis" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "rawAnalysis" TEXT NOT NULL,
    "structuredDiagnosis" TEXT NOT NULL,
    "confidenceLevel" INTEGER NOT NULL DEFAULT 0,
    "riskAssessment" TEXT NOT NULL,
    "patientSymptoms" TEXT,
    "patientVitals" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrgentMedicalAlert" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "diagnosisId" TEXT,
    "alertType" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "alertMessage" TEXT NOT NULL,
    "redFlags" TEXT,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrgentMedicalAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CreditPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmergencyCase_status_isEmergency_createdAt_idx" ON "EmergencyCase"("status", "isEmergency", "createdAt");

-- CreateIndex
CREATE INDEX "EmergencyCall_status_startedAt_idx" ON "EmergencyCall"("status", "startedAt");

-- CreateIndex
CREATE INDEX "KycVerification_verificationStatus_createdAt_idx" ON "KycVerification"("verificationStatus", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "KycVerification_userId_key" ON "KycVerification"("userId");

-- CreateIndex
CREATE INDEX "Consultation_status_type_createdAt_idx" ON "Consultation"("status", "type", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_isRead_createdAt_idx" ON "Notification"("isRead", "createdAt");

-- CreateIndex
CREATE INDEX "HealthMeasurement_sessionId_timestamp_idx" ON "HealthMeasurement"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "HealthMeasurement_patientId_timestamp_idx" ON "HealthMeasurement"("patientId", "timestamp");

-- CreateIndex
CREATE INDEX "HealthAlert_sessionId_acknowledged_idx" ON "HealthAlert"("sessionId", "acknowledged");

-- CreateIndex
CREATE INDEX "HealthAlert_severity_acknowledged_idx" ON "HealthAlert"("severity", "acknowledged");

-- CreateIndex
CREATE INDEX "MedicalDiagnosis_patientId_timestamp_idx" ON "MedicalDiagnosis"("patientId", "timestamp");

-- CreateIndex
CREATE INDEX "MedicalDiagnosis_sessionId_timestamp_idx" ON "MedicalDiagnosis"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "UrgentMedicalAlert_acknowledged_riskLevel_idx" ON "UrgentMedicalAlert"("acknowledged", "riskLevel");

-- CreateIndex
CREATE INDEX "UrgentMedicalAlert_patientId_timestamp_idx" ON "UrgentMedicalAlert"("patientId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_availabilityId_key" ON "Appointment"("availabilityId");

-- CreateIndex
CREATE INDEX "Appointment_status_createdAt_idx" ON "Appointment"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCase" ADD CONSTRAINT "EmergencyCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCase" ADD CONSTRAINT "EmergencyCase_assignedDoctorId_fkey" FOREIGN KEY ("assignedDoctorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCase" ADD CONSTRAINT "EmergencyCase_kycVerificationId_fkey" FOREIGN KEY ("kycVerificationId") REFERENCES "KycVerification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCall" ADD CONSTRAINT "EmergencyCall_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "EmergencyCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCall" ADD CONSTRAINT "EmergencyCall_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCall" ADD CONSTRAINT "EmergencyCall_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycVerification" ADD CONSTRAINT "KycVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "EmergencyCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthMeasurement" ADD CONSTRAINT "HealthMeasurement_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalDiagnosis" ADD CONSTRAINT "MedicalDiagnosis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
