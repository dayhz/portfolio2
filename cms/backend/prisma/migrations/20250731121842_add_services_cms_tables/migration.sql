-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServicesContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT,
    "fieldType" TEXT NOT NULL DEFAULT 'text',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ServicesContent" ("createdAt", "displayOrder", "fieldName", "fieldType", "fieldValue", "id", "section", "updatedAt") SELECT "createdAt", "displayOrder", "fieldName", "fieldType", "fieldValue", "id", "section", "updatedAt" FROM "ServicesContent";
DROP TABLE "ServicesContent";
ALTER TABLE "new_ServicesContent" RENAME TO "ServicesContent";
CREATE INDEX "ServicesContent_section_idx" ON "ServicesContent"("section");
CREATE INDEX "ServicesContent_section_fieldName_idx" ON "ServicesContent"("section", "fieldName");
CREATE UNIQUE INDEX "ServicesContent_section_fieldName_key" ON "ServicesContent"("section", "fieldName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
