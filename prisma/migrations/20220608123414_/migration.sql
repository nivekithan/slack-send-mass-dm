-- CreateTable
CREATE TABLE "Jobs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    "user_ids" TEXT[],

    CONSTRAINT "Jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentMessages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "jobsId" UUID NOT NULL,

    CONSTRAINT "SentMessages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SentMessages" ADD CONSTRAINT "SentMessages_jobsId_fkey" FOREIGN KEY ("jobsId") REFERENCES "Jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
