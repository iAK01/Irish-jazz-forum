"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

// Shared
import StepNavigation from "./shared/StepNavigation";

// Steps
import CoreIdentity    from "./steps/CoreIdentity";
import Location        from "./steps/Location";
import PublicProfile   from "./steps/PublicProfile";
import Media           from "./steps/Media";
import Activity        from "./steps/Activity";
import ArtistProfile   from "./steps/ArtistProfile";
import Education       from "./steps/Education";
import TechnicalCapacity from "./steps/TechnicalCapacity";
import Workforce       from "./steps/Workforce";
import EDI             from "./steps/EDI";
import CareerSupport   from "./steps/CareerSupport";
import Funding         from "./steps/Funding";
import CrossBorder     from "./steps/CrossBorder";
import Partnerships    from "./steps/Partnerships";
import Digital         from "./steps/Digital";
import IJFParticipation from "./steps/IJFParticipation";
import Privacy         from "./steps/Privacy";

// ── Step metadata ────────────────────────────────────────────────────────────
interface StepMeta {
  component: string;
  always: boolean;
  condition?: boolean;
  section: number;
  sectionName: string;
  title: string;
  subtitle: string;
}

const TOTAL_SECTIONS = 5;

// ── Section colours (one per section) ────────────────────────────────────────
const SECTION_COLOUR: Record<number, string> = {
  1: "#4CBB5A",
  2: "#3B82F6",
  3: "#8B5CF6",
  4: "#F59E0B",
  5: "#6B7280",
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface MemberProfileFormProps {
  initialData?: any;
  mode: "create" | "edit";
  isAdmin?: boolean;
}

export default function MemberProfileForm({ initialData, mode, isAdmin = false }: MemberProfileFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      // ── CoreIdentity (flat) ────────────────────────────────────────────
      name: "",
      slug: "",
      memberType: [],
      ecosystemRoles: [],
      legalStatus: "",

      // ── Location (flat) ───────────────────────────────────────────────
      county: "",
      cityTown: "",
      region: "",
      latitude: null,
      longitude: null,

      // ── PublicProfile (flat) ──────────────────────────────────────────
      shortTagline: "",
      longBio: "",
      logoUrl: "",
      heroImageUrl: "",
      galleryImageUrls: [],
      publicTags: [],
      keyProjects: [],
      pressQuotes: [],

      // ── Contact Info / Social Links (nested) ──────────────────────────
      contactInfo: {
        website: "",
        facebook: "",
        instagram: "",
        youtube: "",
        spotify: "",
        bandcamp: "",
        other: [],
      },

      // ── Media / press (nested) ────────────────────────────────────────
      mediaPresence: {
        hasRegularMediaCoverage: false,
        featuredInNationalMedia: [],
        featuredInInternationalMedia: [],
        hasActiveWebsite: false,
        socialMediaPlatforms: [],
        participatesInJazzIreland: false,
      },

      // ── Activity (flat) ───────────────────────────────────────────────
      primaryArtformTags: [],
      activityModes: [],
      geographicReach: "local",
      presentsCrossBorderWork: false,
      hostsInternationalArtists: false,
      annualEventCountEstimate: null,
      annualUniqueArtistsEstimate: null,
      annualAudienceEstimate: null,
      educationProgrammeTypes: [],
      hasRecordingActivity: false,
      usesProfessionalRecording: false,

      // ── ArtistProfile (nested) ────────────────────────────────────────
      artistProfile: {
        instruments: [],
        ensemblesLeading: [],
        ensemblesParticipating: [],
        yearsActive: null,
        hasInternationalTouringExperience: false,
      },

      // ── Education / youthProgrammes (nested) ──────────────────────────
      youthProgrammes: {
        ageRanges: [],
        programmeTypes: [],
        scholarshipsOffered: false,
        alumniSuccessStories: "",
        participatesInSchoolOutreach: false,
      },

      // ── TechnicalCapacity (nested) ────────────────────────────────────
      techBackline: {
        drumKit: false, bassAmp: false, guitarAmp: false,
        keyboardStand: false, paSystem: false, stageMonitors: false,
      },
      techAcousticInstruments: { uprightPiano: false, grandPiano: false, tuned: null },
      techFrontOfHouse: { digitalDesk: false, analogueDesk: false, channelCount: null, technicianAvailable: false },
      stageSpecs: { stageWidthM: null, stageDepthM: null, capacityStanding: null, capacitySeated: null },
      accessSupport: { loadingBay: false, stepFreeAccess: false, dressingRoom: false, backlineStorage: false },

      // ── Workforce (flat) ──────────────────────────────────────────────
      usesWrittenContracts: false,
      volunteerHoursPerYearEstimate: null,
      employsFreelancersRegularly: false,
      hasBoardOrAdvisoryGroup: false,
      boardSize: null,
      hasWrittenStrategy: false,

      // ── EDI (flat) ────────────────────────────────────────────────────
      ediFocusAreas: [],
      accessibilityFeatures: [],
      environmentalSustainabilityPractices: [],

      // ── CareerSupport (nested) ────────────────────────────────────────
      careerSupport: {
        offersMentorship: false,
        providesAdminSupport: false,
        hasBookingAgency: false,
        providesRehearsalSpace: false,
        offersResidencies: false,
      },

      // ── Funding (nested) ──────────────────────────────────────────────
      fundingHistory: {
        artsCouncilGrants: [],
        localAuthoritySupport: [],
        cultureIrelandSupport: [],
        privateSponsorship: [],
      },
      economicImpact: {
        estimatedAnnualValue: null,
        localEmploymentSupported: null,
        touristEngagementEstimate: null,
      },

      // ── CrossBorder (nested) ──────────────────────────────────────────
      crossBorderWork: {
        participatesInNorthSouthCollaboration: false,
        hasPartnershipsInNI: false,
        hasPartnershipsInROI: false,
        borderCountiesServed: [],
      },
      internationalActivity: {
        participatesInShowcases: [],
        hasInternationalPartnerships: [],
        countriesPresented: [],
      },

      // ── Partnerships (nested) ─────────────────────────────────────────
      partnerships: {
        regularCollaborators: [],
        networkMemberships: [],
        projectHistory: [],
      },

      // ── Digital (flat) ────────────────────────────────────────────────
      ticketingSystemsUsed: [],
      crmOrMailingTools: [],
      analyticsTools: [],
      consentToShareAggregatedData: false,
      preferredSurveyChannels: [],

      // ── IJFParticipation (nested) ─────────────────────────────────────
      ijfParticipation: {
        membershipStatus: "",
        joinedAt: null,
        isSteeringCommittee: false,
        workingGroups: [],
        attendedMeetings: [],
        contributedToSubmissions: [],
        willingToBeCaseStudy: false,
        internalNotes: "",
      },

      // ── Privacy (nested) ──────────────────────────────────────────────
      privacySettings: {
        publicProfile: true,
        shareDataForAdvocacy: false,
        consentDate: new Date().toISOString(),
        consentVersion: "1.0",
      },
    },
  });

  // ── Conditional step flags ────────────────────────────────────────────────
  const memberType           = watch("memberType") || [];
  const educationProgrammeTypes = watch("educationProgrammeTypes") || [];

  const showArtistProfile    = (memberType as string[]).includes("artist");
  const showEducation        = (educationProgrammeTypes as string[]).length > 0;
  const showTechnicalCapacity = (memberType as string[]).includes("venue");
  const showIJFParticipation = isAdmin;

  // ── Step mapping ──────────────────────────────────────────────────────────
  const getStepMapping = (): StepMeta[] => {
    const all: StepMeta[] = [
      // ── Section 1: Your Public Face ──────────────────────────────────
      { component: "CoreIdentity",      always: true,  section: 1, sectionName: "Your Public Face",  title: "Who You Are",                 subtitle: "Your name, member type, and legal status" },
      { component: "Location",          always: true,  section: 1, sectionName: "Your Public Face",  title: "Where You're Based",           subtitle: "Your location in Ireland" },
      { component: "PublicProfile",     always: true,  section: 1, sectionName: "Your Public Face",  title: "Your Public Profile",          subtitle: "Bio, photos, tagline, and key projects" },
      { component: "Media",             always: true,  section: 1, sectionName: "Your Public Face",  title: "Links & Visibility",           subtitle: "Website, social media, and press coverage" },

      // ── Section 2: What You Do ────────────────────────────────────────
      { component: "Activity",          always: true,  section: 2, sectionName: "What You Do",       title: "Your Activity",                subtitle: "Artforms, programmes, and geographic reach" },
      { component: "ArtistProfile",     always: false, condition: showArtistProfile,    section: 2, sectionName: "What You Do",       title: "Artist Profile",               subtitle: "Instruments, ensembles, and touring experience" },
      { component: "Education",         always: false, condition: showEducation,        section: 2, sectionName: "What You Do",       title: "Education Programmes",         subtitle: "Your education and outreach work" },
      { component: "TechnicalCapacity", always: false, condition: showTechnicalCapacity, section: 2, sectionName: "What You Do",      title: "Venue Facilities",             subtitle: "Stage, sound, and technical specifications" },

      // ── Section 3: Your Organisation ─────────────────────────────────
      { component: "Workforce",         always: true,  section: 3, sectionName: "Your Organisation", title: "Workforce & Governance",       subtitle: "Staff, volunteers, and how you're run" },
      { component: "EDI",               always: true,  section: 3, sectionName: "Your Organisation", title: "Equality & Inclusion",         subtitle: "EDI focus areas, accessibility, and sustainability" },
      { component: "CareerSupport",     always: true,  section: 3, sectionName: "Your Organisation", title: "Career Support",               subtitle: "Mentorship, space, and professional development" },
      { component: "Funding",           always: true,  section: 3, sectionName: "Your Organisation", title: "Funding & Impact",             subtitle: "Grants, sponsorship, and economic contribution" },

      // ── Section 4: Your Connections ───────────────────────────────────
      { component: "CrossBorder",       always: true,  section: 4, sectionName: "Your Connections",  title: "Cross-Border & International", subtitle: "North-South work and international activity" },
      { component: "Partnerships",      always: true,  section: 4, sectionName: "Your Connections",  title: "Partnerships & Networks",      subtitle: "Collaborators and network memberships" },
      { component: "Digital",           always: true,  section: 4, sectionName: "Your Connections",  title: "Digital Tools",                subtitle: "Ticketing, CRM, and analytics tools you use" },

      // ── Section 5: Finishing Up ───────────────────────────────────────
      { component: "IJFParticipation",  always: false, condition: showIJFParticipation, section: 5, sectionName: "Finishing Up",       title: "IJF Participation",            subtitle: "Forum involvement and membership details" },
      { component: "Privacy",           always: true,  section: 5, sectionName: "Finishing Up",      title: "Privacy & Consent",            subtitle: "How your data is used and displayed" },
    ];
    return all.filter(s => s.always || s.condition);
  };

  const stepMapping  = getStepMapping();
  const totalSteps   = stepMapping.length;
  const currentMeta  = stepMapping[currentStep - 1];
  const nextMeta     = stepMapping[currentStep]; // index offset = upcoming step
  const sectionColour = SECTION_COLOUR[currentMeta?.section ?? 1];

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep = (step: number): boolean => {
    const name = stepMapping[step - 1]?.component;
    if (name === "CoreIdentity") {
      const n = watch("name");
      const s = watch("slug");
      const t = watch("memberType");
      return !!(n && s && t && (t as string[]).length > 0);
    }
    return true;
  };

  const canGoNext = validateStep(currentStep);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(c => c + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(c => c - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const url    = mode === "create" ? "/api/members" : `/api/members/${initialData.slug}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to save profile"); }
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step renderer ─────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentMeta?.component) {
      case "CoreIdentity":      return <CoreIdentity     register={register} watch={watch} setValue={setValue} errors={errors} />;
      case "Location":          return <Location         register={register} errors={errors} />;
      case "PublicProfile":     return <PublicProfile    register={register} watch={watch} setValue={setValue} />;
      case "Media":             return <Media            register={register} watch={watch} setValue={setValue} />;
      case "Activity":          return <Activity         register={register} watch={watch} setValue={setValue} errors={errors} />;
      case "ArtistProfile":     return <ArtistProfile    register={register} watch={watch} setValue={setValue} errors={errors} />;
      case "Education":         return <Education        register={register} watch={watch} setValue={setValue} />;
      case "TechnicalCapacity": return <TechnicalCapacity register={register} />;
      case "Workforce":         return <Workforce        register={register} watch={watch} errors={errors} />;
      case "EDI":               return <EDI              watch={watch} setValue={setValue} />;
      case "CareerSupport":     return <CareerSupport    watch={watch} register={register} />;
      case "Funding":           return <Funding          register={register} watch={watch} setValue={setValue} />;
      case "CrossBorder":       return <CrossBorder      watch={watch} setValue={setValue} />;
      case "Partnerships":      return <Partnerships     watch={watch} setValue={setValue} />;
      case "Digital":           return <Digital          register={register} watch={watch} setValue={setValue} />;
      case "IJFParticipation":  return <IJFParticipation register={register} watch={watch} setValue={setValue} />;
      case "Privacy":           return <Privacy          register={register} watch={watch} />;
      default:                  return <div>Step not found</div>;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ijf-bg py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">

          {/* ── Top accent bar (section colour) ───────────────────────── */}
          <div style={{ height: "4px", backgroundColor: sectionColour, transition: "background-color 0.4s ease" }} />

          <div style={{ padding: "28px 32px" }}>

            {/* ── Step header ───────────────────────────────────────────── */}
            <div style={{ marginBottom: "28px" }}>

              {/* Section pills + step count row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} style={{
                      height: "6px",
                      width: s === currentMeta?.section ? "20px" : "6px",
                      borderRadius: "3px",
                      backgroundColor: s < (currentMeta?.section ?? 1)
                        ? "#4CBB5A"
                        : s === currentMeta?.section
                          ? sectionColour
                          : "#e5e7eb",
                      transition: "all 0.3s ease",
                      flexShrink: 0,
                    }} />
                  ))}
                  <span style={{
                    fontSize: "11px", fontWeight: 700,
                    color: sectionColour,
                    textTransform: "uppercase", letterSpacing: "0.09em",
                    marginLeft: "6px",
                  }}>
                    {currentMeta?.sectionName}
                  </span>
                </div>
                <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: 500 }}>
                  Step {currentStep} of {totalSteps}
                </span>
              </div>

              {/* Title */}
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111827", margin: "0 0 4px 0", lineHeight: 1.25 }}>
                {currentMeta?.title}
              </h1>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 14px 0" }}>
                {currentMeta?.subtitle}
              </p>

              {/* Progress bar */}
              <div style={{ height: "3px", backgroundColor: "#f0f0f0", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(currentStep / totalSteps) * 100}%`,
                  backgroundColor: sectionColour,
                  borderRadius: "2px",
                  transition: "width 0.4s ease, background-color 0.4s ease",
                }} />
              </div>
            </div>

            {/* ── Step content ──────────────────────────────────────────── */}
            <form onSubmit={e => e.preventDefault()}>
              {renderStep()}

              <StepNavigation
                currentStep={currentStep}
                totalSteps={totalSteps}
                onPrevious={handlePrevious}
                onNext={handleNext}
                canGoNext={canGoNext}
                isLastStep={currentStep === totalSteps}
                nextStepTitle={nextMeta?.title}
              />
            </form>

          </div>
        </div>
      </div>

      {/* ── Saving overlay ────────────────────────────────────────────── */}
      {isSubmitting && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>
          <div style={{
            backgroundColor: "white", borderRadius: "12px", padding: "32px 40px", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              border: "3px solid #e5e7eb", borderTopColor: "#4CBB5A",
              margin: "0 auto 16px", animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#111827", margin: 0 }}>Saving your profile…</p>
          </div>
        </div>
      )}
    </div>
  );
}
