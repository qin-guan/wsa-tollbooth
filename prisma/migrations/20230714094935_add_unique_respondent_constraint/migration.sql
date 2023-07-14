/*
  Warnings:

  - A unique constraint covering the columns `[surveyId,respondentId]` on the table `Response` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Response_surveyId_respondentId_key" ON "Response"("surveyId", "respondentId");
