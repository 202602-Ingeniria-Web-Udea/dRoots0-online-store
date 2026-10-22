-- CreateEnum
CREATE TYPE "Enum_MovementType" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateTable
CREATE TABLE "InventoryMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initialBalance" DECIMAL(14,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "InventoryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "type" "Enum_MovementType" NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "masterId" TEXT NOT NULL,
    "responsibleId" TEXT NOT NULL,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryMaster_name_key" ON "InventoryMaster"("name");

-- CreateIndex
CREATE INDEX "InventoryMaster_createdById_idx" ON "InventoryMaster"("createdById");

-- CreateIndex
CREATE INDEX "InventoryMovement_masterId_occurredAt_idx" ON "InventoryMovement"("masterId", "occurredAt");

-- CreateIndex
CREATE INDEX "InventoryMovement_responsibleId_idx" ON "InventoryMovement"("responsibleId");

-- AddForeignKey
ALTER TABLE "InventoryMaster" ADD CONSTRAINT "InventoryMaster_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "InventoryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheck (not representable in the Prisma schema)
ALTER TABLE "InventoryMaster"
    ADD CONSTRAINT "InventoryMaster_initialBalance_nonnegative" CHECK ("initialBalance" >= 0);

ALTER TABLE "InventoryMovement"
    ADD CONSTRAINT "InventoryMovement_quantity_positive" CHECK ("quantity" > 0);

