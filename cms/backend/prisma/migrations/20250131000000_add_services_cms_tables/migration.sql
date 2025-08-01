-- CreateTable
CREATE TABLE "ServicesContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT,
    "fieldType" TEXT NOT NULL DEFAULT 'text',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ServicesVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versionName" TEXT,
    "contentSnapshot" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ServicesContent_section_idx" ON "ServicesContent"("section");

-- CreateIndex
CREATE INDEX "ServicesContent_section_fieldName_idx" ON "ServicesContent"("section", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesContent_section_fieldName_key" ON "ServicesContent"("section", "fieldName");

-- CreateIndex
CREATE INDEX "ServicesVersion_createdAt_idx" ON "ServicesVersion"("createdAt");

-- CreateIndex
CREATE INDEX "ServicesVersion_isActive_idx" ON "ServicesVersion"("isActive");