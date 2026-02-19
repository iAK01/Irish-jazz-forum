"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

// Shared Components
import StepNavigation from "./shared/StepNavigation";

// Step Components
import CoreIdentity from "./steps/CoreIdentity";
import Location from "./steps/Location";
import Activity from "./steps/Activity";
import ArtistProfile from "./steps/ArtistProfile";
import Workforce from "./steps/Workforce";
import EDI from "./steps/EDI";
import Digital from "./steps/Digital";
import Funding from "./steps/Funding";
import CrossBorder from "./steps/CrossBorder";
import Education from "./steps/Education";
import CareerSupport from "./steps/CareerSupport";
import Media from "./steps/Media";
import Partnerships from "./steps/Partnerships";
import IJFParticipation from "./steps/IJFParticipation";
import PublicProfile from "./steps/PublicProfile";
import TechnicalCapacity from "./steps/TechnicalCapacity";
import Privacy from "./steps/Privacy";

interface MemberProfileFormProps {
  initialData?: any;
  mode: "create" | "edit";
  isAdmin?: boolean; // Whether to show admin-only sections like IJFParticipation
}

export default function MemberProfileForm({ initialData, mode, isAdmin = false }: MemberProfileFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      // Core Identity
      name: "",
      slug: "",
      memberType: [],
      ecosystemRoles: [],
      legalStatus: "",
      
      // Location
      county: "",
      cityTown: "",
      region: "",
      latitude: null,
      longitude: null,
      
      // Activity
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
      
      // Artist Profile
      artistProfile: {
        instruments: [],
        ensemblesLeading: [],
        ensemblesParticipating: [],
        yearsActive: null,
        hasInternationalTouringExperience: false,
      },
      
      // Workforce
      workforce: {
        usesWrittenContracts: false,
        volunteerHoursPerYearEstimate: null,
        employsFreelancersRegularly: false,
        hasBoardOrAdvisoryGroup: false,
        boardSize: null,
        hasWrittenStrategy: false,
      },
      
      // EDI
      edi: {
        ediFocusAreas: [],
        accessibilityFeatures: [],
        environmentalSustainabilityPractices: [],
      },
      
      // Digital
      digital: {
        ticketingSystemsUsed: [],
        crmOrMailingTools: [],
        analyticsTools: [],
        consentToShareAggregatedData: false,
        preferredSurveyChannels: [],
      },
      
      // Funding
      funding: {
        artsCouncilGrants: [],
        localAuthoritySupportGrants: [],
        cultureIrelandGrants: [],
        privateSponsorships: [],
        estimatedAnnualValue: null,
        localEmploymentSupported: null,
        touristEngagementEstimate: null,
      },
      
      // Cross Border
      crossBorder: {
        participatesInNorthSouthCollaboration: false,
        hasPartnershipsInNI: false,
        hasPartnershipsInROI: false,
        borderCountiesServed: [],
        participatesInShowcases: [],
        hasInternationalPartnerships: [],
        countriesPresented: [],
      },
      
      // Education
      education: {
        ageRanges: [],
        programmeTypes: [],
        scholarshipsOffered: false,
        alumniSuccessStories: "",
        participatesInSchoolOutreach: false,
      },
      
      // Career Support
      careerSupport: {
        offersMentorship: false,
        providesAdminSupport: false,
        hasBookingAgency: false,
        providesRehearsalSpace: false,
        offersResidencies: false,
      },
      
      // Media
      media: {
        hasRegularMediaCoverage: false,
        featuredInNationalMedia: [],
        featuredInInternationalMedia: [],
        hasActiveWebsite: false,
        socialMediaPlatforms: [],
        participatesInJazzIreland: false,
      },
      
      // Partnerships
      partnerships: {
        regularCollaborators: [],
        networkMemberships: [],
        projectHistory: [],
      },
      
      // IJF Participation (admin only)
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
      
      // Public Profile
      publicProfile: {
        shortTagline: "",
        longBio: "",
        heroImageUrl: "",
        galleryImageUrls: [],
        publicTags: [],
        keyProjects: [],
        pressQuotes: [],
      },
      
      // Technical Capacity
      technicalCapacity: {
        backline: {
          drumKit: false,
          bassAmp: false,
          guitarAmp: false,
          keyboardStand: false,
          paSystem: false,
          stageMonitors: false,
        },
        acousticInstruments: {
          uprightPiano: false,
          grandPiano: false,
          tuned: null,
        },
        frontOfHouse: {
          digitalDesk: false,
          analogueDesk: false,
          channelCount: null,
          technicianAvailable: false,
        },
        stageSpecs: {
          stageWidthM: null,
          stageDepthM: null,
          capacityStanding: null,
          capacitySeated: null,
        },
        accessSupport: {
          loadingBay: false,
          stepFreeAccess: false,
          dressingRoom: false,
          backlineStorage: false,
        },
      },
      
      // Privacy
      privacySettings: {
        publicProfile: true,
        shareDataForAdvocacy: false,
        consentDate: new Date().toISOString(),
        consentVersion: "1.0",
      },
    },
  });

  // Get conditional values
  const memberType = watch("memberType") || [];
  const educationProgrammeTypes = watch("educationProgrammeTypes") || [];
  
  // Determine which steps to show based on conditionals
  const showArtistProfile = memberType.includes("artist");
  const showEducation = educationProgrammeTypes.length > 0;
  const showTechnicalCapacity = memberType.includes("venue");
  const showIJFParticipation = isAdmin; // Only show for admins

  // Calculate total steps and step mapping
  const getStepMapping = () => {
    const steps = [
      { component: "CoreIdentity", always: true },
      { component: "Location", always: true },
      { component: "Activity", always: true },
      { component: "ArtistProfile", always: false, condition: showArtistProfile },
      { component: "Workforce", always: true },
      { component: "EDI", always: true },
      { component: "Digital", always: true },
      { component: "Funding", always: true },
      { component: "CrossBorder", always: true },
      { component: "Education", always: false, condition: showEducation },
      { component: "CareerSupport", always: true },
      { component: "Media", always: true },
      { component: "Partnerships", always: true },
      { component: "IJFParticipation", always: false, condition: showIJFParticipation },
      { component: "PublicProfile", always: true },
      { component: "TechnicalCapacity", always: false, condition: showTechnicalCapacity },
      { component: "Privacy", always: true },
    ];

    return steps.filter(step => step.always || step.condition);
  };

  const stepMapping = getStepMapping();
  const totalSteps = stepMapping.length;

  // Step validation
  const validateStep = (step: number): boolean => {
    const currentStepName = stepMapping[step - 1]?.component;
    
    switch (currentStepName) {
      case "CoreIdentity":
        const name = watch("name");
        const slug = watch("slug");
        const memberTypeVal = watch("memberType");
        return !!(name && slug && memberTypeVal && memberTypeVal.length > 0);
      
      // All other steps are optional
      default:
        return true;
    }
  };

  const canGoNext = validateStep(currentStep);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const url = mode === "create" 
        ? "/api/members"
        : `/api/members/${initialData.slug}`;
      
      const method = mode === "create" ? "POST" : "PATCH";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save profile");
      }

      const result = await response.json();
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(error.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const currentStepName = stepMapping[currentStep - 1]?.component;

    switch (currentStepName) {
      case "CoreIdentity":
        return (
          <CoreIdentity
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
        );
      
      case "Location":
        return (
          <Location
            register={register}
            errors={errors}
          />
        );
      
      case "Activity":
        return (
          <Activity
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
        );
      
      case "ArtistProfile":
        return (
          <ArtistProfile
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
        );
      
      case "Workforce":
        return (
          <Workforce
            register={register}
            watch={watch}
            errors={errors}
          />
        );
      
      case "EDI":
        return (
          <EDI
            watch={watch}
            setValue={setValue}
          />
        );
      
      case "Digital":
        return (
          <Digital
            register={register}
            watch={watch}
            setValue={setValue}
          />
        );
      
      case "Funding":
        return (
          <Funding
            register={register}
            watch={watch}
            setValue={setValue}
          />
        );
      
      case "CrossBorder":
        return (
          <CrossBorder
            watch={watch}
            setValue={setValue}
          />
        );
      
      case "Education":
        return (
          <Education
            register={register}
            watch={watch}
            setValue={setValue}
          />
        );
      
      case "CareerSupport":
        return (
          <CareerSupport
            register={register}
          />
        );
      
      case "Media":
        return (
          <Media
            register={register}
            watch={watch}
            setValue={setValue}
          />
        );
      
      case "Partnerships":
        return (
          <Partnerships
            watch={watch}
            setValue={setValue}
          />
        );
      
      case "IJFParticipation":
        return (
          <IJFParticipation
            register={register}
            watch={watch}
            setValue={setValue}
          />
        );
      
      case "PublicProfile":
        return (
          <PublicProfile
            register={register}
            watch={watch}
            setValue={setValue}
          />
        );
      
      case "TechnicalCapacity":
        return (
          <TechnicalCapacity
            register={register}
          />
        );
      
      case "Privacy":
        return (
          <Privacy
            register={register}
            watch={watch}
          />
        );
      
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-ijf-bg py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ijf-accent mb-2">
              {mode === "create" ? "Create" : "Edit"} Member Profile
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Complete your profile to join the Irish Jazz Forum directory
            </p>
            
            {/* Step indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{stepMapping[currentStep - 1]?.component}</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mt-2">
                <div
                  className="bg-ijf-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Conditional Step Notice */}
          {!showArtistProfile && memberType.length > 0 && (
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
    
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()}>
            {renderStep()}

            {/* Navigation */}
            <StepNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onPrevious={handlePrevious}
              onNext={handleNext}
              canGoNext={canGoNext}
              isLastStep={currentStep === totalSteps}
            />
          </form>

          {/* Submitting Overlay */}
          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ijf-accent mx-auto mb-4"></div>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Saving your profile...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}