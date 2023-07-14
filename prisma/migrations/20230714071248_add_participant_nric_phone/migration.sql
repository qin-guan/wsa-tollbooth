-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nric" STRING;
ALTER TABLE "User" ADD COLUMN     "phone" STRING;
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
