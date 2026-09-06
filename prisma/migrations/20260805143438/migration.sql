-- CreateEnum
CREATE TYPE "CourierProvider" AS ENUM ('PATHAO');

-- CreateEnum
CREATE TYPE "CourierEnvironment" AS ENUM ('SANDBOX', 'PRODUCTION');

-- CreateTable
CREATE TABLE "courier_tokens" (
    "id" TEXT NOT NULL,
    "provider" "CourierProvider" NOT NULL,
    "environment" "CourierEnvironment" NOT NULL DEFAULT 'SANDBOX',
    "token_type" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "access_token_expires_at" TIMESTAMP(3) NOT NULL,
    "last_issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courier_tokens_access_token_expires_at_idx" ON "courier_tokens"("access_token_expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "courier_tokens_provider_environment_key" ON "courier_tokens"("provider", "environment");
