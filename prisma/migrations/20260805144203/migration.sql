/*
  Warnings:

  - The values [PRODUCTION] on the enum `CourierEnvironment` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CourierEnvironment_new" AS ENUM ('SANDBOX', 'LIVE');
ALTER TABLE "public"."courier_tokens" ALTER COLUMN "environment" DROP DEFAULT;
ALTER TABLE "courier_tokens" ALTER COLUMN "environment" TYPE "CourierEnvironment_new" USING ("environment"::text::"CourierEnvironment_new");
ALTER TYPE "CourierEnvironment" RENAME TO "CourierEnvironment_old";
ALTER TYPE "CourierEnvironment_new" RENAME TO "CourierEnvironment";
DROP TYPE "public"."CourierEnvironment_old";
ALTER TABLE "courier_tokens" ALTER COLUMN "environment" SET DEFAULT 'SANDBOX';
COMMIT;
