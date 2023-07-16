/*
  Warnings:

  - You are about to drop the column `schema` on the `Survey` table. All the data in the column will be lost.
  - Added the required column `questions` to the `Survey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Survey" RENAME COLUMN "schema" TO "questions";
