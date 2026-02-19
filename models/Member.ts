// /models/Member.ts

import { Schema, model, models, Document } from "mongoose";

export type MemberType =
  | "artist"
  | "collective"
  | "organisation"
  | "festival"
  | "venue"
  | "promoter"
  | "education"
  | "media"
  | "label"
  | "audience_rep";

export type Region =
  | "Dublin"
  | "Leinster"
  | "Munster"
  | "Connacht"
  | "Ulster (ROI)"
  | "Northern Ireland";

export type GeographicReach =
  | "local"
  | "regional"
  | "national"
  | "all_island"
  | "international";

export type MembershipStatus = "prospective" | "active" | "lapsed" | "observer";

export type LegalStatus =
  | "registered_charity"
  | "clg"
  | "sole_trader"
  | "partnership"
  | "informal_collective"
  | "student_society"
  | "ltd"
  | "other";

export type WorkingGroup =
  | "advocacy"
  | "data_research"
  | "education_youth"
  | "inclusion_edi"
  | "festival_development"
  | "cross_border";

export type EcosystemRole =
  | "touring_network_participant"
  | "youth_education_provider"
  | "international_showcase_organizer"
  | "recording_archive_contributor"
  | "disability_arts_specialist"
  | "cross_border_facilitator"
  | "venue_provider"
  | "funding_applicant"
  | "media_content_creator";

// A person attached to this member organisation
export interface MemberUser {
  userId: string;       // ObjectId string of the User
  userEmail: string;    // denormalised for easy querying
  role: "primary" | "staff"; // primary = created the profile and can edit it, staff = access only
  addedAt: Date;
}

export interface Member extends Document {
  // ==========================================
  // CORE IDENTITY
  // ==========================================
  name: string;
  slug: string;
  memberType: MemberType[];
  ecosystemRoles: EcosystemRole[];
  legalStatus?: LegalStatus;

  // ==========================================
  // LINKED USERS
  // Multi-user support: multiple people can belong to one org
  // ==========================================
  users: MemberUser[];

  // ==========================================
  // LOCATION & GEOGRAPHY
  // ==========================================
  county?: string;
  cityTown?: string;
  region?: Region;
  latitude?: number;
  longitude?: number;

  // ==========================================
  // ACTIVITY PROFILE
  // ==========================================
  primaryArtformTags: string[];
  activityModes: string[];
  geographicReach: GeographicReach;
  presentsCrossBorderWork: boolean;
  hostsInternationalArtists: boolean;
  annualEventCountEstimate?: number;
  annualUniqueArtistsEstimate?: number;
  annualAudienceEstimate?: number;
  educationProgrammeTypes: string[];
  hasRecordingActivity: boolean;
  usesProfessionalRecording: boolean;

  // ==========================================
  // ARTIST-SPECIFIC PROFILE (optional)
  // ==========================================
  artistProfile?: {
    instruments: string[];
    ensemblesLeading: string[];
    ensemblesParticipating: string[];
    yearsActive?: number;
    hasInternationalTouringExperience: boolean;
  };

  // ==========================================
  // WORKFORCE / GOVERNANCE / EDI
  // ==========================================
  usesWrittenContracts: boolean;
  volunteerHoursPerYearEstimate?: number;
  employsFreelancersRegularly: boolean;
  hasBoardOrAdvisoryGroup: boolean;
  boardSize?: number;
  hasWrittenStrategy: boolean;
  ediFocusAreas: string[];
  accessibilityFeatures: string[];
  environmentalSustainabilityPractices: string[];

  // ==========================================
  // DIGITAL CAPACITY
  // ==========================================
  ticketingSystemsUsed: string[];
  crmOrMailingTools: string[];
  analyticsTools: string[];
  consentToShareAggregatedData: boolean;
  preferredSurveyChannels: string[];

  // ==========================================
  // FUNDING & ECONOMIC IMPACT
  // ==========================================
  fundingHistory: {
    artsCouncilGrants: {
      year: number;
      amount: number;
      scheme: string;
      successful: boolean;
    }[];
    localAuthoritySupport: {
      authority: string;
      year: number;
      amount: number;
      scheme?: string;
    }[];
    cultureIrelandSupport: {
      year: number;
      amount: number;
      destination?: string;
    }[];
    privateSponsorship: {
      sponsor: string;
      year: number;
      amount?: number;
      inkind?: string;
    }[];
  };

  economicImpact?: {
    estimatedAnnualValue: number;
    localEmploymentSupported?: number;
    touristEngagementEstimate?: number;
  };

  // ==========================================
  // CROSS-BORDER & INTERNATIONAL
  // ==========================================
  crossBorderWork: {
    participatesInNorthSouthCollaboration: boolean;
    hasPartnershipsInNI: boolean;
    hasPartnershipsInROI: boolean;
    borderCountiesServed: string[];
  };

  internationalActivity: {
    participatesInShowcases: string[];
    hasInternationalPartnerships: string[];
    countriesPresented: string[];
  };

  // ==========================================
  // EDUCATION & YOUTH PATHWAYS
  // ==========================================
  youthProgrammes?: {
    ageRanges: string[];
    programmeTypes: string[];
    scholarshipsOffered: boolean;
    alumniSuccessStories: string[];
    participatesInSchoolOutreach: boolean;
  };

  // ==========================================
  // CAREER SUPPORT & PROFESSIONAL DEVELOPMENT
  // ==========================================
  careerSupport?: {
    offersMentorship: boolean;
    providesAdminSupport: boolean;
    hasBookingAgency: boolean;
    providesRehearsalSpace: boolean;
    offersResidencies: boolean;
  };

  // ==========================================
  // MEDIA & VISIBILITY
  // ==========================================
  mediaPresence: {
    hasRegularMediaCoverage: boolean;
    featuredInNationalMedia: string[];
    featuredInInternationalMedia: string[];
    hasActiveWebsite: boolean;
    socialMediaPlatforms: string[];
    participatesInJazzIreland: boolean;
  };

  // ==========================================
  // PARTNERSHIPS & COLLABORATION
  // ==========================================
  partnerships: {
    regularCollaborators: string[];
    projectHistory: {
      partnerSlug: string;
      projectName: string;
      year: number;
      fundingSource?: string;
      description?: string;
    }[];
    networkMemberships: string[];
  };

  // ==========================================
  // IJF-SPECIFIC / FORUM PARTICIPATION
  // ==========================================
  membershipStatus: MembershipStatus;
  joinedAt: Date;
  lastProfileUpdatedAt?: Date;

  forumParticipation: {
    isSteeringCommittee: boolean;
    workingGroups: WorkingGroup[];
    attendedMeetings: Date[];
    contributedToSubmissions: string[];
  };

  willingToBeCaseStudy: boolean;
  internalNotes?: string;

  // ==========================================
  // PUBLIC PROFILE
  // ==========================================
  shortTagline?: string;
  longBio?: string;
  heroImageUrl?: string;
  logoUrl?: string;
  galleryImageUrls: string[];
  publicTags: string[];

  keyProjects: {
    name: string;
    year?: number;
    summary?: string;
    url?: string;
  }[];

  pressQuotes: {
    quote: string;
    source: string;
    year?: number;
  }[];

  // ==========================================
  // TECHNICAL CAPACITY (VENUES)
  // ==========================================
  techBackline: {
    drumKit: boolean;
    bassAmp: boolean;
    guitarAmp: boolean;
    keyboardStand: boolean;
    paSystem: boolean;
    stageMonitors: boolean;
  };

  techAcousticInstruments: {
    uprightPiano: boolean;
    grandPiano: boolean;
    tuned: boolean | null;
  };

  techFrontOfHouse: {
    digitalDesk: boolean;
    analogueDesk: boolean;
    channelCount?: number;
    technicianAvailable: boolean;
  };

  stageSpecs: {
    stageWidthM?: number;
    stageDepthM?: number;
    capacityStanding?: number;
    capacitySeated?: number;
  };

  accessSupport: {
    loadingBay: boolean;
    stepFreeAccess: boolean;
    dressingRoom: boolean;
    backlineStorage: boolean;
  };

  // ==========================================
  // PRIVACY & CONSENT
  // ==========================================
  privacySettings: {
    publicProfile: boolean;
    shareDataForAdvocacy: boolean;
    consentDate: Date;
    consentVersion: string;
  };
}

const MemberSchema = new Schema<Member>(
  {
    // Core Identity
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    memberType: [{
      type: String,
      enum: [
        "artist", "collective", "organisation", "festival", "venue",
        "promoter", "education", "media", "label", "audience_rep",
      ],
    }],
    ecosystemRoles: [{ type: String }],
    legalStatus: {
      type: String,
      enum: [
        "registered_charity", "clg", "sole_trader", "partnership",
        "informal_collective", "student_society", "ltd", "other",
      ],
    },

    // Linked users — multiple people can belong to one org
    users: [
      {
        userId: { type: String, required: true },
        userEmail: { type: String, required: true },
        role: { type: String, enum: ["primary", "staff"], default: "staff" },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // Location
    county: { type: String },
    cityTown: { type: String },
    region: {
      type: String,
      enum: ["Dublin", "Leinster", "Munster", "Connacht", "Ulster (ROI)", "Northern Ireland"],
    },
    latitude: Number,
    longitude: Number,

    // Activity Profile
    primaryArtformTags: [{ type: String }],
    activityModes: [{ type: String }],
    geographicReach: {
      type: String,
      enum: ["local", "regional", "national", "all_island", "international"],
      default: "local",
    },
    presentsCrossBorderWork: { type: Boolean, default: false },
    hostsInternationalArtists: { type: Boolean, default: false },
    annualEventCountEstimate: Number,
    annualUniqueArtistsEstimate: Number,
    annualAudienceEstimate: Number,
    educationProgrammeTypes: [{ type: String }],
    hasRecordingActivity: { type: Boolean, default: false },
    usesProfessionalRecording: { type: Boolean, default: false },

    // Artist Profile
    artistProfile: {
      instruments: [{ type: String }],
      ensemblesLeading: [{ type: String }],
      ensemblesParticipating: [{ type: String }],
      yearsActive: Number,
      hasInternationalTouringExperience: { type: Boolean, default: false },
    },

    // Workforce/Governance
    usesWrittenContracts: { type: Boolean, default: false },
    volunteerHoursPerYearEstimate: Number,
    employsFreelancersRegularly: { type: Boolean, default: false },
    hasBoardOrAdvisoryGroup: { type: Boolean, default: false },
    boardSize: Number,
    hasWrittenStrategy: { type: Boolean, default: false },

    // EDI
    ediFocusAreas: [{ type: String }],
    accessibilityFeatures: [{ type: String }],
    environmentalSustainabilityPractices: [{ type: String }],

    // Digital Capacity
    ticketingSystemsUsed: [{ type: String }],
    crmOrMailingTools: [{ type: String }],
    analyticsTools: [{ type: String }],
    consentToShareAggregatedData: { type: Boolean, default: false },
    preferredSurveyChannels: [{ type: String }],

    // Funding & Economic Impact
    fundingHistory: {
      artsCouncilGrants: [
        {
          year: { type: Number, required: true },
          amount: { type: Number, required: true },
          scheme: { type: String, required: true },
          successful: { type: Boolean, required: true },
        },
      ],
      localAuthoritySupport: [
        {
          authority: { type: String, required: true },
          year: { type: Number, required: true },
          amount: { type: Number, required: true },
          scheme: String,
        },
      ],
      cultureIrelandSupport: [
        {
          year: { type: Number, required: true },
          amount: { type: Number, required: true },
          destination: String,
        },
      ],
      privateSponsorship: [
        {
          sponsor: { type: String, required: true },
          year: { type: Number, required: true },
          amount: Number,
          inkind: String,
        },
      ],
    },

    economicImpact: {
      estimatedAnnualValue: Number,
      localEmploymentSupported: Number,
      touristEngagementEstimate: Number,
    },

    // Cross-Border & International
    crossBorderWork: {
      participatesInNorthSouthCollaboration: { type: Boolean, default: false },
      hasPartnershipsInNI: { type: Boolean, default: false },
      hasPartnershipsInROI: { type: Boolean, default: false },
      borderCountiesServed: [{ type: String }],
    },

    internationalActivity: {
      participatesInShowcases: [{ type: String }],
      hasInternationalPartnerships: [{ type: String }],
      countriesPresented: [{ type: String }],
    },

    // Youth Programmes
    youthProgrammes: {
      ageRanges: [{ type: String }],
      programmeTypes: [{ type: String }],
      scholarshipsOffered: { type: Boolean, default: false },
      alumniSuccessStories: [{ type: String }],
      participatesInSchoolOutreach: { type: Boolean, default: false },
    },

    // Career Support
    careerSupport: {
      offersMentorship: { type: Boolean, default: false },
      providesAdminSupport: { type: Boolean, default: false },
      hasBookingAgency: { type: Boolean, default: false },
      providesRehearsalSpace: { type: Boolean, default: false },
      offersResidencies: { type: Boolean, default: false },
    },

    // Media & Visibility
    mediaPresence: {
      hasRegularMediaCoverage: { type: Boolean, default: false },
      featuredInNationalMedia: [{ type: String }],
      featuredInInternationalMedia: [{ type: String }],
      hasActiveWebsite: { type: Boolean, default: false },
      socialMediaPlatforms: [{ type: String }],
      participatesInJazzIreland: { type: Boolean, default: false },
    },

    // Partnerships
    partnerships: {
      regularCollaborators: [{ type: String }],
      projectHistory: [
        {
          partnerSlug: { type: String, required: true },
          projectName: { type: String, required: true },
          year: { type: Number, required: true },
          fundingSource: String,
          description: String,
        },
      ],
      networkMemberships: [{ type: String }],
    },

    // Forum Participation
    membershipStatus: {
      type: String,
      enum: ["prospective", "active", "lapsed", "observer"],
      default: "prospective",
    },
    joinedAt: { type: Date, default: Date.now },
    lastProfileUpdatedAt: { type: Date },

    forumParticipation: {
      isSteeringCommittee: { type: Boolean, default: false },
      workingGroups: [{ type: String }],
      attendedMeetings: [{ type: Date }],
      contributedToSubmissions: [{ type: String }],
    },

    willingToBeCaseStudy: { type: Boolean, default: false },
    internalNotes: { type: String },

    // Public Profile
    shortTagline: { type: String },
    longBio: { type: String },
    heroImageUrl: { type: String },
    logoUrl: { type: String },
    galleryImageUrls: [{ type: String }],
    publicTags: [{ type: String }],

    keyProjects: [
      {
        name: { type: String, required: true },
        year: Number,
        summary: String,
        url: String,
      },
    ],

    pressQuotes: [
      {
        quote: { type: String, required: true },
        source: { type: String, required: true },
        year: Number,
      },
    ],

    // Technical Capacity
    techBackline: {
      drumKit: { type: Boolean, default: false },
      bassAmp: { type: Boolean, default: false },
      guitarAmp: { type: Boolean, default: false },
      keyboardStand: { type: Boolean, default: false },
      paSystem: { type: Boolean, default: false },
      stageMonitors: { type: Boolean, default: false },
    },

    techAcousticInstruments: {
      uprightPiano: { type: Boolean, default: false },
      grandPiano: { type: Boolean, default: false },
      tuned: { type: Boolean, default: null },
    },

    techFrontOfHouse: {
      digitalDesk: { type: Boolean, default: false },
      analogueDesk: { type: Boolean, default: false },
      channelCount: Number,
      technicianAvailable: { type: Boolean, default: false },
    },

    stageSpecs: {
      stageWidthM: Number,
      stageDepthM: Number,
      capacityStanding: Number,
      capacitySeated: Number,
    },

    accessSupport: {
      loadingBay: { type: Boolean, default: false },
      stepFreeAccess: { type: Boolean, default: false },
      dressingRoom: { type: Boolean, default: false },
      backlineStorage: { type: Boolean, default: false },
    },

    // Privacy & Consent
    privacySettings: {
      publicProfile: { type: Boolean, default: true },
      shareDataForAdvocacy: { type: Boolean, default: false },
      consentDate: { type: Date, required: true, default: Date.now },
      consentVersion: { type: String, required: true, default: "1.0" },
    },
  },
  {
    timestamps: true,
  }
);

MemberSchema.index({ memberType: 1 });
MemberSchema.index({ region: 1 });
MemberSchema.index({ "users.userId": 1 });
MemberSchema.index({ "users.userEmail": 1 });
MemberSchema.index({ "partnerships.regularCollaborators": 1 });
MemberSchema.index({ "forumParticipation.workingGroups": 1 });

export const MemberModel = models.Member || model<Member>("Member", MemberSchema);