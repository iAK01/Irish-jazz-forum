// app/dashboard/profile/page.tsx

import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MemberProfileForm from "@/app/components/members/MemberProfileForm";
import dbConnect from "@/lib/mongodb";
import { MemberModel } from "@/models/Member";

/**
 * Transforms MongoDB document into the exact field structure each step component watches.
 * Field paths here MUST match what each step component uses with register() or watch().
 */
function transformMemberData(m: any) {
  return {
    // ── CoreIdentity: flat ────────────────────────────────────
    name: m.name || "",
    slug: m.slug || "",
    memberType: m.memberType || [],
    ecosystemRoles: m.ecosystemRoles || [],
    legalStatus: m.legalStatus || "",

    // ── Location: flat ────────────────────────────────────────
    county: m.county || "",
    cityTown: m.cityTown || "",
    region: m.region || "",
    latitude: m.latitude ?? null,
    longitude: m.longitude ?? null,

    // ── Activity: flat ────────────────────────────────────────
    primaryArtformTags: m.primaryArtformTags || [],
    activityModes: m.activityModes || [],
    geographicReach: m.geographicReach || "local",
    presentsCrossBorderWork: m.presentsCrossBorderWork || false,
    hostsInternationalArtists: m.hostsInternationalArtists || false,
    annualEventCountEstimate: m.annualEventCountEstimate ?? null,
    annualUniqueArtistsEstimate: m.annualUniqueArtistsEstimate ?? null,
    annualAudienceEstimate: m.annualAudienceEstimate ?? null,
    educationProgrammeTypes: m.educationProgrammeTypes || [],
    hasRecordingActivity: m.hasRecordingActivity || false,
    usesProfessionalRecording: m.usesProfessionalRecording || false,

    // ── ArtistProfile: nested as artistProfile{} ──────────────
    artistProfile: {
      instruments: m.artistProfile?.instruments || [],
      ensemblesLeading: m.artistProfile?.ensemblesLeading || [],
      ensemblesParticipating: m.artistProfile?.ensemblesParticipating || [],
      yearsActive: m.artistProfile?.yearsActive ?? null,
      hasInternationalTouringExperience: m.artistProfile?.hasInternationalTouringExperience || false,
    },

    // ── Workforce: flat (component uses register("usesWrittenContracts") etc.) ──
    usesWrittenContracts: m.usesWrittenContracts ?? false,
    volunteerHoursPerYearEstimate: m.volunteerHoursPerYearEstimate ?? null,
    employsFreelancersRegularly: m.employsFreelancersRegularly ?? false,
    hasBoardOrAdvisoryGroup: m.hasBoardOrAdvisoryGroup ?? false,
    boardSize: m.boardSize ?? null,
    hasWrittenStrategy: m.hasWrittenStrategy ?? false,

    // ── EDI: flat (component uses watch("ediFocusAreas") etc.) ──
    ediFocusAreas: m.ediFocusAreas || [],
    accessibilityFeatures: m.accessibilityFeatures || [],
    environmentalSustainabilityPractices: m.environmentalSustainabilityPractices || [],

    // ── Digital: flat (component uses watch("ticketingSystemsUsed") etc.) ──
    ticketingSystemsUsed: m.ticketingSystemsUsed || [],
    crmOrMailingTools: m.crmOrMailingTools || [],
    analyticsTools: m.analyticsTools || [],
    consentToShareAggregatedData: m.consentToShareAggregatedData ?? false,
    preferredSurveyChannels: m.preferredSurveyChannels || [],

    // ── Funding: nested as fundingHistory{} (component watches fundingHistory.*) ──
    fundingHistory: {
      artsCouncilGrants: m.fundingHistory?.artsCouncilGrants || [],
      localAuthoritySupport: m.fundingHistory?.localAuthoritySupport || [],
      cultureIrelandSupport: m.fundingHistory?.cultureIrelandSupport || [],
      privateSponsorship: m.fundingHistory?.privateSponsorship || [],
    },
    economicImpact: {
      estimatedAnnualValue: m.economicImpact?.estimatedAnnualValue ?? null,
      localEmploymentSupported: m.economicImpact?.localEmploymentSupported ?? null,
      touristEngagementEstimate: m.economicImpact?.touristEngagementEstimate ?? null,
    },

    // ── CrossBorder: nested as crossBorderWork{} and internationalActivity{} ──
    crossBorderWork: {
      participatesInNorthSouthCollaboration: m.crossBorderWork?.participatesInNorthSouthCollaboration ?? false,
      hasPartnershipsInNI: m.crossBorderWork?.hasPartnershipsInNI ?? false,
      hasPartnershipsInROI: m.crossBorderWork?.hasPartnershipsInROI ?? false,
      borderCountiesServed: m.crossBorderWork?.borderCountiesServed || [],
    },
    internationalActivity: {
      participatesInShowcases: m.internationalActivity?.participatesInShowcases || [],
      hasInternationalPartnerships: m.internationalActivity?.hasInternationalPartnerships || [],
      countriesPresented: m.internationalActivity?.countriesPresented || [],
    },

    // ── Education: nested as youthProgrammes{} ───────────────
    youthProgrammes: {
      ageRanges: m.youthProgrammes?.ageRanges || [],
      programmeTypes: m.youthProgrammes?.programmeTypes || [],
      scholarshipsOffered: m.youthProgrammes?.scholarshipsOffered ?? false,
      alumniSuccessStories: m.youthProgrammes?.alumniSuccessStories?.[0] ?? m.youthProgrammes?.alumniSuccessStories ?? "",
      participatesInSchoolOutreach: m.youthProgrammes?.participatesInSchoolOutreach ?? false,
    },

    // ── CareerSupport: nested as careerSupport{} ─────────────
    careerSupport: {
      offersMentorship: m.careerSupport?.offersMentorship ?? false,
      providesAdminSupport: m.careerSupport?.providesAdminSupport ?? false,
      hasBookingAgency: m.careerSupport?.hasBookingAgency ?? false,
      providesRehearsalSpace: m.careerSupport?.providesRehearsalSpace ?? false,
      offersResidencies: m.careerSupport?.offersResidencies ?? false,
    },

    // ── Media: nested as mediaPresence{} ─────────────────────
    mediaPresence: {
      hasRegularMediaCoverage: m.mediaPresence?.hasRegularMediaCoverage ?? false,
      featuredInNationalMedia: m.mediaPresence?.featuredInNationalMedia || [],
      featuredInInternationalMedia: m.mediaPresence?.featuredInInternationalMedia || [],
      hasActiveWebsite: m.mediaPresence?.hasActiveWebsite ?? false,
      socialMediaPlatforms: m.mediaPresence?.socialMediaPlatforms || [],
      participatesInJazzIreland: m.mediaPresence?.participatesInJazzIreland ?? false,
    },

    // ── Partnerships: nested as partnerships{} ────────────────
    partnerships: {
      regularCollaborators: m.partnerships?.regularCollaborators || [],
      networkMemberships: m.partnerships?.networkMemberships || [],
      projectHistory: m.partnerships?.projectHistory || [],
    },

    // ── IJFParticipation: nested as ijfParticipation{} ───────
    // (old DB stored these as forumParticipation{} + flat fields)
    ijfParticipation: {
      membershipStatus: m.ijfParticipation?.membershipStatus ?? m.membershipStatus ?? "",
      joinedAt: m.ijfParticipation?.joinedAt ?? m.joinedAt ?? null,
      isSteeringCommittee: m.ijfParticipation?.isSteeringCommittee ?? m.forumParticipation?.isSteeringCommittee ?? false,
      workingGroups: m.ijfParticipation?.workingGroups ?? m.forumParticipation?.workingGroups ?? [],
      attendedMeetings: m.ijfParticipation?.attendedMeetings ?? m.forumParticipation?.attendedMeetings ?? [],
      contributedToSubmissions: m.ijfParticipation?.contributedToSubmissions ?? m.forumParticipation?.contributedToSubmissions ?? [],
      willingToBeCaseStudy: m.ijfParticipation?.willingToBeCaseStudy ?? m.willingToBeCaseStudy ?? false,
      internalNotes: m.ijfParticipation?.internalNotes ?? "",
    },

    // ── PublicProfile: flat (component watches "shortTagline", "logoUrl" etc.) ──
    shortTagline: m.shortTagline || "",
    longBio: m.longBio || "",
    logoUrl: m.logoUrl || "",
    heroImageUrl: m.heroImageUrl || m.logoUrl || "",
    galleryImageUrls: m.galleryImageUrls || [],
    publicTags: m.publicTags || [],
    keyProjects: m.keyProjects || [],
    pressQuotes: m.pressQuotes || [],

    // ── TechnicalCapacity: nested as techBackline{}, techAcousticInstruments{},
    //    techFrontOfHouse{}, stageSpecs{}, accessSupport{} ─────
    techBackline: {
      drumKit: m.techBackline?.drumKit ?? false,
      bassAmp: m.techBackline?.bassAmp ?? false,
      guitarAmp: m.techBackline?.guitarAmp ?? false,
      keyboardStand: m.techBackline?.keyboardStand ?? false,
      paSystem: m.techBackline?.paSystem ?? false,
      stageMonitors: m.techBackline?.stageMonitors ?? false,
    },
    techAcousticInstruments: {
      uprightPiano: m.techAcousticInstruments?.uprightPiano ?? false,
      grandPiano: m.techAcousticInstruments?.grandPiano ?? false,
      tuned: m.techAcousticInstruments?.tuned ?? false,
    },
    techFrontOfHouse: {
      digitalDesk: m.techFrontOfHouse?.digitalDesk ?? false,
      analogueDesk: m.techFrontOfHouse?.analogueDesk ?? false,
      channelCount: m.techFrontOfHouse?.channelCount ?? null,
      technicianAvailable: m.techFrontOfHouse?.technicianAvailable ?? false,
    },
    stageSpecs: {
      stageWidthM: m.stageSpecs?.stageWidthM ?? null,
      stageDepthM: m.stageSpecs?.stageDepthM ?? null,
      capacityStanding: m.stageSpecs?.capacityStanding ?? null,
      capacitySeated: m.stageSpecs?.capacitySeated ?? null,
    },
    accessSupport: {
      loadingBay: m.accessSupport?.loadingBay ?? false,
      stepFreeAccess: m.accessSupport?.stepFreeAccess ?? false,
      dressingRoom: m.accessSupport?.dressingRoom ?? false,
      backlineStorage: m.accessSupport?.backlineStorage ?? false,
    },

    // ── Privacy ───────────────────────────────────────────────
    privacySettings: {
      publicProfile: m.privacySettings?.publicProfile ?? true,
      shareDataForAdvocacy: m.privacySettings?.shareDataForAdvocacy ?? false,
      consentDate: m.privacySettings?.consentDate ?? new Date().toISOString(),
      consentVersion: m.privacySettings?.consentVersion ?? "1.0",
    },
  };
}

export default async function ProfilePage() {
  try {
    const user = await requireAuth();
    await dbConnect();

    let memberData = null;
    let mode: "create" | "edit" = "create";

    if (user.memberProfile) {
      const member = await MemberModel.findOne({ slug: user.memberProfile }).lean();
      if (member) {
        memberData = transformMemberData(JSON.parse(JSON.stringify(member)));
        mode = "edit";
      }
    }

    return (
      <MemberProfileForm
        initialData={memberData}
        mode={mode}
      />
    );
  } catch (error) {
    redirect("/api/auth/signin");
  }
}