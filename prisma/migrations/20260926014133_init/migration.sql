-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('ALUMNI', 'ASSOCIATE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'ADMIN', 'SUPER_ADMIN', 'EXCO_ADMIN', 'FINANCE_ADMIN', 'WELFARE_ADMIN', 'CONTENT_ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAYSTACK', 'FLUTTERWAVE', 'BANK_TRANSFER', 'CASH');

-- CreateEnum
CREATE TYPE "DuesType" AS ENUM ('ANNUAL_DUES', 'SPECIAL_LEVY', 'PROJECT_LEVY');

-- CreateEnum
CREATE TYPE "WelfareCategory" AS ENUM ('EMERGENCY', 'BEREAVEMENT', 'ILLNESS', 'FINANCIAL_ASSISTANCE', 'DISASTER_RELIEF', 'OTHER');

-- CreateEnum
CREATE TYPE "WelfareUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "WelfareStatus" AS ENUM ('NEW', 'PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('ASSOCIATION_NEWS', 'OFFICIAL_ANNOUNCEMENT', 'SCHOOL_MANAGEMENT', 'ALUMNI_ACHIEVEMENT', 'WEDDING', 'BEREAVEMENT', 'CAREER_MILESTONE', 'IMPORTANT_NOTICE');

-- CreateEnum
CREATE TYPE "GalleryCategory" AS ENUM ('INDIVIDUAL_ALUMNI', 'GRADUATING_SET', 'REUNION', 'AGM', 'ALUMNI_EVENT', 'UNIVERSITY_MEMORIES', 'HISTORICAL_ARCHIVE', 'OTHER');

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL DEFAULT 'image',
    "format" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "folder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraduatingSet" (
    "id" TEXT NOT NULL,
    "setName" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduatingSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT,
    "isDiaspora" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialAlumniDirectory" (
    "id" TEXT NOT NULL,
    "matricNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "graduatingSetId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficialAlumniDirectory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "matricNumber" TEXT,
    "memberType" "MemberType" NOT NULL DEFAULT 'ALUMNI',
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "graduatingSetId" TEXT,
    "facultyId" TEXT,
    "department" TEXT,
    "locationId" TEXT,
    "diasporaCountry" TEXT,
    "diasporaCity" TEXT,
    "profession" TEXT,
    "company" TEXT,
    "bio" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profilePhotoMediaId" TEXT,
    "privacySettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bannerMediaId" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "meetingLink" TEXT,
    "organizer" TEXT NOT NULL DEFAULT 'CUAA',
    "category" TEXT NOT NULL DEFAULT 'General',
    "capacity" INTEGER,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsAnnouncement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "NewsCategory" NOT NULL DEFAULT 'OFFICIAL_ANNOUNCEMENT',
    "bannerMediaId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryAlbum" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GalleryCategory" NOT NULL DEFAULT 'ALUMNI_EVENT',
    "graduatingSetId" TEXT,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "caption" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessListing" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "logoMediaId" TEXT,
    "bannerMediaId" TEXT,
    "address" TEXT,
    "stateCity" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuesItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "DuesType" NOT NULL DEFAULT 'ANNUAL_DUES',
    "amount" DOUBLE PRECISION NOT NULL,
    "academicYear" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DuesItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationCampaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "raisedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "duesItemId" TEXT,
    "donationCampaignId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'PAYSTACK',
    "transactionRef" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "proofMediaId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelfareRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "category" "WelfareCategory" NOT NULL DEFAULT 'OTHER',
    "urgency" "WelfareUrgency" NOT NULL DEFAULT 'MEDIUM',
    "status" "WelfareStatus" NOT NULL DEFAULT 'NEW',
    "description" TEXT NOT NULL,
    "assignedOfficerId" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WelfareRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscussionPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscussionComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "messageText" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "linkUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadershipProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "photoMediaId" TEXT,
    "termStart" INTEGER NOT NULL,
    "termEnd" INTEGER,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadershipProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_cloudinaryPublicId_key" ON "Media"("cloudinaryPublicId");

-- CreateIndex
CREATE UNIQUE INDEX "GraduatingSet_setName_key" ON "GraduatingSet"("setName");

-- CreateIndex
CREATE UNIQUE INDEX "GraduatingSet_graduationYear_key" ON "GraduatingSet"("graduationYear");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_name_key" ON "Faculty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_code_key" ON "Faculty"("code");

-- CreateIndex
CREATE INDEX "Location_state_idx" ON "Location"("state");

-- CreateIndex
CREATE UNIQUE INDEX "Location_state_city_key" ON "Location"("state", "city");

-- CreateIndex
CREATE UNIQUE INDEX "OfficialAlumniDirectory_matricNumber_key" ON "OfficialAlumniDirectory"("matricNumber");

-- CreateIndex
CREATE INDEX "OfficialAlumniDirectory_matricNumber_idx" ON "OfficialAlumniDirectory"("matricNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_matricNumber_key" ON "Member"("matricNumber");

-- CreateIndex
CREATE INDEX "Member_matricNumber_idx" ON "Member"("matricNumber");

-- CreateIndex
CREATE INDEX "Member_email_idx" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_verificationStatus_idx" ON "Member"("verificationStatus");

-- CreateIndex
CREATE INDEX "Member_graduatingSetId_idx" ON "Member"("graduatingSetId");

-- CreateIndex
CREATE INDEX "Member_facultyId_idx" ON "Member"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_hashedToken_key" ON "RefreshToken"("hashedToken");

-- CreateIndex
CREATE INDEX "RefreshToken_memberId_idx" ON "RefreshToken"("memberId");

-- CreateIndex
CREATE INDEX "RefreshToken_hashedToken_idx" ON "RefreshToken"("hashedToken");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_eventDate_idx" ON "Event"("eventDate");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_eventId_memberId_key" ON "EventRegistration"("eventId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsAnnouncement_slug_key" ON "NewsAnnouncement"("slug");

-- CreateIndex
CREATE INDEX "NewsAnnouncement_category_idx" ON "NewsAnnouncement"("category");

-- CreateIndex
CREATE INDEX "NewsAnnouncement_publishedAt_idx" ON "NewsAnnouncement"("publishedAt");

-- CreateIndex
CREATE INDEX "GalleryAlbum_category_idx" ON "GalleryAlbum"("category");

-- CreateIndex
CREATE INDEX "GalleryAlbum_graduatingSetId_idx" ON "GalleryAlbum"("graduatingSetId");

-- CreateIndex
CREATE INDEX "GalleryPhoto_albumId_idx" ON "GalleryPhoto"("albumId");

-- CreateIndex
CREATE INDEX "BusinessListing_status_idx" ON "BusinessListing"("status");

-- CreateIndex
CREATE INDEX "BusinessListing_category_idx" ON "BusinessListing"("category");

-- CreateIndex
CREATE INDEX "BusinessListing_memberId_idx" ON "BusinessListing"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_transactionRef_key" ON "PaymentRecord"("transactionRef");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_receiptNumber_key" ON "PaymentRecord"("receiptNumber");

-- CreateIndex
CREATE INDEX "PaymentRecord_memberId_idx" ON "PaymentRecord"("memberId");

-- CreateIndex
CREATE INDEX "PaymentRecord_status_idx" ON "PaymentRecord"("status");

-- CreateIndex
CREATE INDEX "PaymentRecord_transactionRef_idx" ON "PaymentRecord"("transactionRef");

-- CreateIndex
CREATE INDEX "WelfareRequest_memberId_idx" ON "WelfareRequest"("memberId");

-- CreateIndex
CREATE INDEX "WelfareRequest_status_idx" ON "WelfareRequest"("status");

-- CreateIndex
CREATE INDEX "WelfareRequest_urgency_idx" ON "WelfareRequest"("urgency");

-- CreateIndex
CREATE INDEX "DiscussionPost_category_idx" ON "DiscussionPost"("category");

-- CreateIndex
CREATE INDEX "DiscussionPost_authorId_idx" ON "DiscussionPost"("authorId");

-- CreateIndex
CREATE INDEX "DiscussionComment_postId_idx" ON "DiscussionComment"("postId");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_receiverId_idx" ON "ChatMessage"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "Notification_memberId_isRead_idx" ON "Notification"("memberId", "isRead");

-- CreateIndex
CREATE INDEX "LeadershipProfile_isCurrent_orderIndex_idx" ON "LeadershipProfile"("isCurrent", "orderIndex");

-- AddForeignKey
ALTER TABLE "OfficialAlumniDirectory" ADD CONSTRAINT "OfficialAlumniDirectory_graduatingSetId_fkey" FOREIGN KEY ("graduatingSetId") REFERENCES "GraduatingSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialAlumniDirectory" ADD CONSTRAINT "OfficialAlumniDirectory_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_profilePhotoMediaId_fkey" FOREIGN KEY ("profilePhotoMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_graduatingSetId_fkey" FOREIGN KEY ("graduatingSetId") REFERENCES "GraduatingSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_bannerMediaId_fkey" FOREIGN KEY ("bannerMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsAnnouncement" ADD CONSTRAINT "NewsAnnouncement_bannerMediaId_fkey" FOREIGN KEY ("bannerMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsAnnouncement" ADD CONSTRAINT "NewsAnnouncement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_graduatingSetId_fkey" FOREIGN KEY ("graduatingSetId") REFERENCES "GraduatingSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessListing" ADD CONSTRAINT "BusinessListing_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessListing" ADD CONSTRAINT "BusinessListing_logoMediaId_fkey" FOREIGN KEY ("logoMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessListing" ADD CONSTRAINT "BusinessListing_bannerMediaId_fkey" FOREIGN KEY ("bannerMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_duesItemId_fkey" FOREIGN KEY ("duesItemId") REFERENCES "DuesItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_donationCampaignId_fkey" FOREIGN KEY ("donationCampaignId") REFERENCES "DonationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_proofMediaId_fkey" FOREIGN KEY ("proofMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelfareRequest" ADD CONSTRAINT "WelfareRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelfareRequest" ADD CONSTRAINT "WelfareRequest_assignedOfficerId_fkey" FOREIGN KEY ("assignedOfficerId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionPost" ADD CONSTRAINT "DiscussionPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionPost" ADD CONSTRAINT "DiscussionPost_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionComment" ADD CONSTRAINT "DiscussionComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "DiscussionPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionComment" ADD CONSTRAINT "DiscussionComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadershipProfile" ADD CONSTRAINT "LeadershipProfile_photoMediaId_fkey" FOREIGN KEY ("photoMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
