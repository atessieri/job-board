/*
  Warnings:

  - You are about to drop the column `coverletter` on the `Application` table. All the data in the column will be lost.
  - Added the required column `coverLetter` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "coverletter",
ADD COLUMN     "coverLetter" TEXT NOT NULL;
