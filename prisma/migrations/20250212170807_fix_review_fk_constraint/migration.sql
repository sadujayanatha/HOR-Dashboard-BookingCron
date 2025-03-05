-- RenameForeignKey
ALTER TABLE "reviews" RENAME CONSTRAINT "reviews_channel_reference_fkey" TO "fk_review_booking";
