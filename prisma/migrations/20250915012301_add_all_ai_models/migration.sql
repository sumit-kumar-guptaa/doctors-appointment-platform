-- CreateTable
CREATE TABLE "TranslationSession" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "doctorId" TEXT,
    "sourceLanguage" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "medicalContext" TEXT,
    "realTimeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "totalTranslations" INTEGER NOT NULL DEFAULT 0,
    "averageConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "medicalTermsTranslated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "TranslationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalTranslation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "sourceLanguage" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "medicalTermsDetected" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmotionAnalysis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "patientId" TEXT,
    "emotionData" TEXT NOT NULL,
    "stressLevel" INTEGER NOT NULL DEFAULT 0,
    "anxietyLevel" INTEGER NOT NULL DEFAULT 0,
    "painIndication" INTEGER NOT NULL DEFAULT 0,
    "psychologicalDistress" INTEGER NOT NULL DEFAULT 0,
    "medicalIndicators" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmotionAlert" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "patientId" TEXT,
    "doctorId" TEXT,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "emotionData" TEXT,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugInteractionSession" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "initialMedicationCount" INTEGER NOT NULL DEFAULT 0,
    "finalMedicationCount" INTEGER NOT NULL DEFAULT 0,
    "validatedMedicationCount" INTEGER NOT NULL DEFAULT 0,
    "totalInteractionChecks" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "DrugInteractionSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientMedication" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "rxcui" TEXT,
    "dosage" TEXT,
    "frequency" TEXT,
    "route" TEXT NOT NULL DEFAULT 'oral',
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugInteractionCheck" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "newMedicationName" TEXT NOT NULL,
    "newMedicationRxcui" TEXT,
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "requiresAction" BOOLEAN NOT NULL DEFAULT false,
    "recommendation" TEXT,
    "interactionData" TEXT,
    "riskAnalysis" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrugInteractionCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugInteraction" (
    "id" TEXT NOT NULL,
    "checkId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "drug1Name" TEXT NOT NULL,
    "drug1Rxcui" TEXT,
    "drug2Name" TEXT NOT NULL,
    "drug2Rxcui" TEXT,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'RxNav',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrugInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugInteractionAlert" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "checkId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recommendation" TEXT,
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "criticalInteractions" INTEGER NOT NULL DEFAULT 0,
    "majorInteractions" INTEGER NOT NULL DEFAULT 0,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrugInteractionAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationChange" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "medicationRxcui" TEXT,
    "medicationData" TEXT,
    "interactionData" TEXT,
    "riskData" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalAISession" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "healthMonitoringEnabled" BOOLEAN NOT NULL DEFAULT true,
    "medicalDiagnosisEnabled" BOOLEAN NOT NULL DEFAULT true,
    "translationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emotionAnalysisEnabled" BOOLEAN NOT NULL DEFAULT true,
    "drugInteractionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "systemsInitialized" INTEGER NOT NULL DEFAULT 0,
    "initializationData" TEXT,
    "endResults" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "MedicalAISession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalAIAlert" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "alertData" TEXT,
    "requiresImmediateAction" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalAIAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranslationSession_status_createdAt_idx" ON "TranslationSession"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MedicalTranslation_sessionId_timestamp_idx" ON "MedicalTranslation"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "EmotionAnalysis_sessionId_timestamp_idx" ON "EmotionAnalysis"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "EmotionAnalysis_patientId_timestamp_idx" ON "EmotionAnalysis"("patientId", "timestamp");

-- CreateIndex
CREATE INDEX "EmotionAlert_sessionId_acknowledged_idx" ON "EmotionAlert"("sessionId", "acknowledged");

-- CreateIndex
CREATE INDEX "EmotionAlert_severity_acknowledged_idx" ON "EmotionAlert"("severity", "acknowledged");

-- CreateIndex
CREATE INDEX "DrugInteractionSession_patientId_status_idx" ON "DrugInteractionSession"("patientId", "status");

-- CreateIndex
CREATE INDEX "PatientMedication_sessionId_status_idx" ON "PatientMedication"("sessionId", "status");

-- CreateIndex
CREATE INDEX "PatientMedication_patientId_status_idx" ON "PatientMedication"("patientId", "status");

-- CreateIndex
CREATE INDEX "DrugInteractionCheck_sessionId_timestamp_idx" ON "DrugInteractionCheck"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "DrugInteractionCheck_riskLevel_requiresAction_idx" ON "DrugInteractionCheck"("riskLevel", "requiresAction");

-- CreateIndex
CREATE INDEX "DrugInteraction_checkId_idx" ON "DrugInteraction"("checkId");

-- CreateIndex
CREATE INDEX "DrugInteraction_severity_idx" ON "DrugInteraction"("severity");

-- CreateIndex
CREATE INDEX "DrugInteractionAlert_sessionId_acknowledged_idx" ON "DrugInteractionAlert"("sessionId", "acknowledged");

-- CreateIndex
CREATE INDEX "DrugInteractionAlert_severity_acknowledged_idx" ON "DrugInteractionAlert"("severity", "acknowledged");

-- CreateIndex
CREATE INDEX "MedicationChange_sessionId_timestamp_idx" ON "MedicationChange"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "MedicationChange_patientId_action_idx" ON "MedicationChange"("patientId", "action");

-- CreateIndex
CREATE INDEX "MedicalAISession_patientId_status_idx" ON "MedicalAISession"("patientId", "status");

-- CreateIndex
CREATE INDEX "MedicalAISession_doctorId_status_idx" ON "MedicalAISession"("doctorId", "status");

-- CreateIndex
CREATE INDEX "MedicalAIAlert_sessionId_acknowledged_idx" ON "MedicalAIAlert"("sessionId", "acknowledged");

-- CreateIndex
CREATE INDEX "MedicalAIAlert_severity_acknowledged_idx" ON "MedicalAIAlert"("severity", "acknowledged");

-- AddForeignKey
ALTER TABLE "EmotionAnalysis" ADD CONSTRAINT "EmotionAnalysis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionAlert" ADD CONSTRAINT "EmotionAlert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalAIAlert" ADD CONSTRAINT "MedicalAIAlert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
