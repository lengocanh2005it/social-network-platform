-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "GroupMemberRole" AS ENUM ('member', 'censor', 'owner');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('inactive', 'active');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('google', 'facebook', 'local');

-- CreateEnum
CREATE TYPE "PostPrivacies" AS ENUM ('public', 'only_friend', 'only_me');

-- CreateEnum
CREATE TYPE "PostContentType" AS ENUM ('text', 'link');

-- CreateEnum
CREATE TYPE "PostContentLanguage" AS ENUM ('vn', 'en');

-- CreateEnum
CREATE TYPE "GroupJoinRequestsStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ContentStoryType" AS ENUM ('text', 'image');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('friend_request', 'friend_request_accepted', 'friend_request_rejected', 'post_liked', 'post_commented', 'comment_replied', 'post_shared', 'tagged_in_post', 'tagged_in_comment', 'group_invite', 'group_join_request', 'group_role_changed', 'followed_you', 'birthday_reminder', 'system_announcement');

-- CreateEnum
CREATE TYPE "FriendShipStatus" AS ENUM ('appcepted', 'rejected', 'pending');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'file');

-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255),
    "password" VARCHAR(255),
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'user',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "phone_number" VARCHAR(255) NOT NULL,
    "gender" "Gender" NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "bio" TEXT,
    "status" "ProfileStatus" NOT NULL DEFAULT 'active',
    "nickname" VARCHAR(50),
    "cover_photo_url" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,

    CONSTRAINT "UserProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthAccounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" "OAuthProvider" NOT NULL,
    "provider_id" TEXT,
    "user_id" UUID NOT NULL,

    CONSTRAINT "OAuthAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEducations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_name" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,

    CONSTRAINT "UserEducations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSocials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "social_name" VARCHAR(255) NOT NULL,
    "social_link" TEXT NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "UserSocials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWorkPlaces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_name" VARCHAR(255) NOT NULL,
    "position" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "user_id" UUID NOT NULL,

    CONSTRAINT "UserWorkPlaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDevices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "finger_print" TEXT NOT NULL,
    "device_name" VARCHAR(255) NOT NULL,
    "user_agent" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "is_trusted" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,

    CONSTRAINT "UserDevices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HashTags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "HashTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "privacy" "PostPrivacies" NOT NULL,
    "total_likes" INTEGER NOT NULL DEFAULT 0,
    "total_comments" INTEGER NOT NULL DEFAULT 0,
    "total_shares" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "user_id" UUID NOT NULL,
    "group_id" UUID,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLikes" (
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "liked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLikes_pkey" PRIMARY KEY ("post_id","user_id")
);

-- CreateTable
CREATE TABLE "PostShares" (
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostShares_pkey" PRIMARY KEY ("post_id","user_id")
);

-- CreateTable
CREATE TABLE "PostContents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "type" "PostContentType" NOT NULL DEFAULT 'text',
    "language" "PostContentLanguage" NOT NULL DEFAULT 'en',
    "post_id" UUID NOT NULL,

    CONSTRAINT "PostContents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostVideos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "video_url" TEXT NOT NULL,
    "total_likes" INTEGER NOT NULL,
    "total_comments" INTEGER NOT NULL,
    "total_shares" INTEGER NOT NULL,
    "post_id" UUID NOT NULL,

    CONSTRAINT "PostVideos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostVideoLikes" (
    "post_video_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "liked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostVideoLikes_pkey" PRIMARY KEY ("post_video_id","user_id")
);

-- CreateTable
CREATE TABLE "PostVideoShares" (
    "post_video_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostVideoShares_pkey" PRIMARY KEY ("post_video_id","user_id")
);

-- CreateTable
CREATE TABLE "PostImages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "image_url" TEXT NOT NULL,
    "total_likes" INTEGER NOT NULL,
    "total_comments" INTEGER NOT NULL,
    "total_shares" INTEGER NOT NULL,
    "post_id" UUID NOT NULL,

    CONSTRAINT "PostImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostImageLikes" (
    "post_image_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "liked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostImageLikes_pkey" PRIMARY KEY ("post_image_id","user_id")
);

-- CreateTable
CREATE TABLE "PostImageShares" (
    "post_image_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostImageShares_pkey" PRIMARY KEY ("post_image_id","user_id")
);

-- CreateTable
CREATE TABLE "PostHashTags" (
    "post_id" UUID NOT NULL,
    "hashtag_id" UUID NOT NULL,

    CONSTRAINT "PostHashTags_pkey" PRIMARY KEY ("post_id","hashtag_id")
);

-- CreateTable
CREATE TABLE "PostTags" (
    "post_id" UUID NOT NULL,
    "tagged_user_id" UUID NOT NULL,

    CONSTRAINT "PostTags_pkey" PRIMARY KEY ("post_id","tagged_user_id")
);

-- CreateTable
CREATE TABLE "Comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "post_id" UUID,
    "post_video_id" UUID,
    "post_image_id" UUID,
    "parent_comment_id" UUID,
    "user_id" UUID NOT NULL,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentLikes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "comment_id" UUID NOT NULL,

    CONSTRAINT "CommentLikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover_photo_url" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,

    CONSTRAINT "Groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembers" (
    "group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "GroupMemberRole" NOT NULL,

    CONSTRAINT "GroupMembers_pkey" PRIMARY KEY ("group_id","user_id")
);

-- CreateTable
CREATE TABLE "GroupJoinRequests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" "GroupJoinRequestsStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "GroupJoinRequests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content_type" "ContentStoryType" NOT NULL DEFAULT 'text',
    "content_url" TEXT,
    "text_content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "Stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryViews" (
    "story_id" UUID NOT NULL,
    "viewer_id" UUID NOT NULL,

    CONSTRAINT "StoryViews_pkey" PRIMARY KEY ("story_id","viewer_id")
);

-- CreateTable
CREATE TABLE "StoryReactions" (
    "story_id" UUID NOT NULL,
    "viewer_id" UUID NOT NULL,
    "reaction" TEXT NOT NULL,
    "reacted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryReactions_pkey" PRIMARY KEY ("story_id","viewer_id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "NotificationType" NOT NULL,
    "messages" TEXT NOT NULL,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipient_id" UUID NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friends" (
    "friendship_status" "FriendShipStatus" NOT NULL DEFAULT 'pending',
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "initiator_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,

    CONSTRAINT "Friends_pkey" PRIMARY KEY ("initiator_id","target_id")
);

-- CreateTable
CREATE TABLE "Followers" (
    "user_id" UUID NOT NULL,
    "follower_id" UUID NOT NULL,

    CONSTRAINT "Followers_pkey" PRIMARY KEY ("user_id","follower_id")
);

-- CreateTable
CREATE TABLE "Blocks" (
    "user_id" UUID NOT NULL,
    "blocked_user_id" UUID NOT NULL,

    CONSTRAINT "Blocks_pkey" PRIMARY KEY ("user_id","blocked_user_id")
);

-- CreateTable
CREATE TABLE "Conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "is_group" BOOLEAN NOT NULL DEFAULT false,
    "group_name" TEXT,
    "group_avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,

    CONSTRAINT "Conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipants" (
    "user_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaved_at" TIMESTAMP(3),

    CONSTRAINT "ConversationParticipants_pkey" PRIMARY KEY ("user_id","conversation_id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "message_type" "MessageType" NOT NULL DEFAULT 'text',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "conversation_id" UUID NOT NULL,
    "reply_to_message_id" UUID,
    "user_id" UUID NOT NULL,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReactions" (
    "message_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reaction_type" TEXT NOT NULL,
    "reacted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageReactions_pkey" PRIMARY KEY ("message_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfiles_phone_number_key" ON "UserProfiles"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfiles_user_id_key" ON "UserProfiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccounts_provider_id_key" ON "OAuthAccounts"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccounts_user_id_key" ON "OAuthAccounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevices_user_id_key" ON "UserDevices"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMembers_group_id_user_id_key" ON "GroupMembers"("group_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "StoryViews_story_id_viewer_id_key" ON "StoryViews"("story_id", "viewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "StoryReactions_story_id_viewer_id_key" ON "StoryReactions"("story_id", "viewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Followers_user_id_follower_id_key" ON "Followers"("user_id", "follower_id");

-- CreateIndex
CREATE UNIQUE INDEX "Blocks_user_id_blocked_user_id_key" ON "Blocks"("user_id", "blocked_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipants_user_id_conversation_id_key" ON "ConversationParticipants"("user_id", "conversation_id");

-- AddForeignKey
ALTER TABLE "UserProfiles" ADD CONSTRAINT "UserProfiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthAccounts" ADD CONSTRAINT "OAuthAccounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEducations" ADD CONSTRAINT "UserEducations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSocials" ADD CONSTRAINT "UserSocials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkPlaces" ADD CONSTRAINT "UserWorkPlaces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDevices" ADD CONSTRAINT "UserDevices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLikes" ADD CONSTRAINT "PostLikes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLikes" ADD CONSTRAINT "PostLikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostShares" ADD CONSTRAINT "PostShares_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostShares" ADD CONSTRAINT "PostShares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostContents" ADD CONSTRAINT "PostContents_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVideos" ADD CONSTRAINT "PostVideos_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVideoLikes" ADD CONSTRAINT "PostVideoLikes_post_video_id_fkey" FOREIGN KEY ("post_video_id") REFERENCES "PostVideos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVideoLikes" ADD CONSTRAINT "PostVideoLikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVideoShares" ADD CONSTRAINT "PostVideoShares_post_video_id_fkey" FOREIGN KEY ("post_video_id") REFERENCES "PostVideos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVideoShares" ADD CONSTRAINT "PostVideoShares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImages" ADD CONSTRAINT "PostImages_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImageLikes" ADD CONSTRAINT "PostImageLikes_post_image_id_fkey" FOREIGN KEY ("post_image_id") REFERENCES "PostImages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImageLikes" ADD CONSTRAINT "PostImageLikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImageShares" ADD CONSTRAINT "PostImageShares_post_image_id_fkey" FOREIGN KEY ("post_image_id") REFERENCES "PostImages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImageShares" ADD CONSTRAINT "PostImageShares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashTags" ADD CONSTRAINT "PostHashTags_hashtag_id_fkey" FOREIGN KEY ("hashtag_id") REFERENCES "HashTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashTags" ADD CONSTRAINT "PostHashTags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTags" ADD CONSTRAINT "PostTags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTags" ADD CONSTRAINT "PostTags_tagged_user_id_fkey" FOREIGN KEY ("tagged_user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "Comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_post_image_id_fkey" FOREIGN KEY ("post_image_id") REFERENCES "PostImages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_post_video_id_fkey" FOREIGN KEY ("post_video_id") REFERENCES "PostVideos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLikes" ADD CONSTRAINT "CommentLikes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLikes" ADD CONSTRAINT "CommentLikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupJoinRequests" ADD CONSTRAINT "GroupJoinRequests_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupJoinRequests" ADD CONSTRAINT "GroupJoinRequests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stories" ADD CONSTRAINT "Stories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryViews" ADD CONSTRAINT "StoryViews_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "Stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryViews" ADD CONSTRAINT "StoryViews_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryReactions" ADD CONSTRAINT "StoryReactions_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "Stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryReactions" ADD CONSTRAINT "StoryReactions_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_initiator_id_fkey" FOREIGN KEY ("initiator_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Followers" ADD CONSTRAINT "Followers_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Followers" ADD CONSTRAINT "Followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocks" ADD CONSTRAINT "Blocks_blocked_user_id_fkey" FOREIGN KEY ("blocked_user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocks" ADD CONSTRAINT "Blocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversations" ADD CONSTRAINT "Conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipants" ADD CONSTRAINT "ConversationParticipants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "Conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipants" ADD CONSTRAINT "ConversationParticipants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "Conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_reply_to_message_id_fkey" FOREIGN KEY ("reply_to_message_id") REFERENCES "Messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
