// Location: app/components/members/steps/Privacy.tsx

"use client";

import { UseFormRegister, UseFormWatch } from "react-hook-form";

interface PrivacyProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
}

export default function Privacy({ register, watch }: PrivacyProps) {
  const publicProfile = watch("privacySettings.publicProfile");
  const shareDataForAdvocacy = watch("privacySettings.shareDataForAdvocacy");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Privacy & Data Sharing</h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Your privacy is important to us. Please review and update your data sharing preferences below.
        </p>
      </div>

      {/* Public Profile */}
      <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("privacySettings.publicProfile")}
            className="w-5 h-5 mt-1"
          />
          <div>
            <span className="block font-medium text-zinc-900 dark:text-zinc-100">
              Make my profile public
            </span>
            <span className="block text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Your profile will be visible in the public member directory at /members. 
              You can control which information is displayed in your profile settings.
            </span>
          </div>
        </label>
      </div>

      {/* Share Data for Advocacy */}
      <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("privacySettings.shareDataForAdvocacy")}
            className="w-5 h-5 mt-1"
          />
          <div>
            <span className="block font-medium text-zinc-900 dark:text-zinc-100">
              Share aggregated data for advocacy purposes
            </span>
            <span className="block text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Allow the Irish Jazz Forum to use your data (in aggregated, anonymized form) 
              for sector-wide advocacy, policy submissions, and reports to funders. 
              Individual identifying information will never be shared without your explicit consent.
            </span>
          </div>
        </label>
      </div>

      {/* Data Usage Explanation */}
      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          How we use your data
        </h3>
        <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
          <li className="flex gap-2">
            <span className="text-ijf-accent">•</span>
            <span>
              <strong>Profile visibility:</strong> If your profile is public, other members and 
              visitors can see your basic information, activity, and public projects.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-ijf-accent">•</span>
            <span>
              <strong>Advocacy data:</strong> We compile sector-wide statistics (e.g., "X% of venues 
              provide accessible facilities") without revealing individual identities.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-ijf-accent">•</span>
            <span>
              <strong>Internal use:</strong> Your complete profile is accessible to IJF administrators 
              for member support, working group coordination, and forum operations.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-ijf-accent">•</span>
            <span>
              <strong>Your rights:</strong> You can update these preferences at any time, request 
              your data, or delete your profile by contacting us.
            </span>
          </li>
        </ul>
      </div>

      {/* Consent Information (read-only) */}
      <div className="border-t border-zinc-300 dark:border-zinc-700 pt-4 mt-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          By completing this profile, you acknowledge that you have read and understood our data 
          handling practices. Your consent is recorded with version 1.0 of our privacy policy.
        </p>
      </div>

      {/* Hidden fields for consent tracking */}
      <input
        type="hidden"
        {...register("privacySettings.consentDate")}
        value={new Date().toISOString()}
      />
      <input
        type="hidden"
        {...register("privacySettings.consentVersion")}
        value="1.0"
      />
    </div>
  );
}