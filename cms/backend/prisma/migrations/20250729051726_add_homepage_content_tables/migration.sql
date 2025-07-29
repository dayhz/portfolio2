-- CreateTable
CREATE TABLE "HomepageContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT,
    "fieldType" TEXT NOT NULL DEFAULT 'text',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HomepageVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versionName" TEXT,
    "contentSnapshot" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "HomepageContent_section_idx" ON "HomepageContent"("section");

-- CreateIndex
CREATE INDEX "HomepageContent_section_fieldName_idx" ON "HomepageContent"("section", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageContent_section_fieldName_key" ON "HomepageContent"("section", "fieldName");

-- CreateIndex
CREATE INDEX "HomepageVersion_createdAt_idx" ON "HomepageVersion"("createdAt");

-- CreateIndex
CREATE INDEX "HomepageVersion_isActive_idx" ON "HomepageVersion"("isActive");
