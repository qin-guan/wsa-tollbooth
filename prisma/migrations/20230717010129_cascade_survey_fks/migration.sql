-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_respondentId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_surveyId_fkey";

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
