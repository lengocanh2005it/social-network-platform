-- CreateTable
CREATE TABLE "PostShareHashTags" (
    "post_share_id" UUID NOT NULL,
    "hashtag_id" UUID NOT NULL,

    CONSTRAINT "PostShareHashTags_pkey" PRIMARY KEY ("post_share_id","hashtag_id")
);

-- AddForeignKey
ALTER TABLE "PostShareHashTags" ADD CONSTRAINT "PostShareHashTags_hashtag_id_fkey" FOREIGN KEY ("hashtag_id") REFERENCES "HashTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostShareHashTags" ADD CONSTRAINT "PostShareHashTags_post_share_id_fkey" FOREIGN KEY ("post_share_id") REFERENCES "PostShares"("id") ON DELETE CASCADE ON UPDATE CASCADE;
