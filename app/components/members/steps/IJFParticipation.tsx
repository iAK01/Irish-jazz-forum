// Location: app/components/members/steps/IJFParticipation.tsx
// NOTE: This component should only be displayed/accessible to Super Admins in the admin dashboard

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface IJFParticipationProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const WORKING_GROUPS = [
  { value: "advocacy", label: "Advocacy" },
  { value: "data_research", label: "Data & Research" },
  { value: "education_youth", label: "Education & Youth" },
  { value: "inclusion_edi", label: "Inclusion & EDI" },
  { value: "festival_development", label: "Festival Development" },
  { value: "cross_border", label: "Cross-Border" },
];

export default function IJFParticipation({ register, watch, setValue }: IJFParticipationProps) {
  const workingGroups = watch("ijfParticipation.workingGroups") || [];
  const attendedMeetings = watch("ijfParticipation.attendedMeetings") || [];
  const contributedToSubmissions = watch("ijfParticipation.contributedToSubmissions") || [];

  const toggleWorkingGroup = (group: string) => {
    const current = workingGroups;
    if (current.includes(group)) {
      setValue("ijfParticipation.workingGroups", current.filter((g: string) => g !== group));
    } else {
      setValue("ijfParticipation.workingGroups", [...current, group]);
    }
  };

  const addMeeting = () => {
    const input = document.getElementById("meeting-date") as HTMLInputElement;
    if (input && input.value) {
      const newDate = input.value;
      if (!attendedMeetings.includes(newDate)) {
        setValue("ijfParticipation.attendedMeetings", [...attendedMeetings, newDate]);
      }
      input.value = "";
    }
  };

  const removeMeeting = (date: string) => {
    setValue("ijfParticipation.attendedMeetings", attendedMeetings.filter((d: string) => d !== date));
  };

  const addSubmission = () => {
    const input = document.getElementById("submission-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newSubmission = input.value.trim();
      if (!contributedToSubmissions.includes(newSubmission)) {
        setValue("ijfParticipation.contributedToSubmissions", [...contributedToSubmissions, newSubmission]);
      }
      input.value = "";
    }
  };

  const removeSubmission = (submission: string) => {
    setValue("ijfParticipation.contributedToSubmissions", contributedToSubmissions.filter((s: string) => s !== submission));
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          ⚠️ ADMIN ONLY - This section should only be visible/editable by Super Admins
        </p>
      </div>

      <h2 className="text-2xl font-bold text-ijf-accent mb-4">IJF Participation (Admin Only)</h2>

      {/* Membership Status */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Membership Status
        </label>
        <select
          {...register("ijfParticipation.membershipStatus")}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        >
          <option value="">Select status</option>
          <option value="prospective">Prospective</option>
          <option value="active">Active</option>
          <option value="lapsed">Lapsed</option>
          <option value="observer">Observer</option>
        </select>
      </div>

      {/* Joined Date */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Joined Date
        </label>
        <input
          type="date"
          {...register("ijfParticipation.joinedAt")}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        />
      </div>

      {/* Steering Committee */}
      <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("ijfParticipation.isSteeringCommittee")}
            className="w-5 h-5 mt-1"
          />
          <div>
            <span className="block font-medium text-zinc-900 dark:text-zinc-100">
              Steering Committee Member
            </span>
            <span className="block text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              This member serves on the IJF Steering Committee
            </span>
          </div>
        </label>
      </div>

      {/* Working Groups */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Working Groups
        </label>
        <p className="text-xs text-zinc-500 mb-3">
          Select all working groups this member participates in
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {WORKING_GROUPS.map((group) => {
            const isSelected = workingGroups.includes(group.value);
            
            return (
              <label
                key={group.value}
                className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleWorkingGroup(group.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {group.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Attended Meetings */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Attended Meetings
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="date"
            id="meeting-date"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={addMeeting}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/90"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {attendedMeetings.map((date: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {new Date(date).toLocaleDateString()}
              </span>
              <button
                type="button"
                onClick={() => removeMeeting(date)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          {attendedMeetings.length === 0 && (
            <p className="text-sm text-zinc-500 italic">No meetings recorded</p>
          )}
        </div>
      </div>

      {/* Contributed to Submissions */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Contributed to Submissions
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            id="submission-input"
            placeholder="e.g., Music Policy 2022, Arts Council Submission"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={addSubmission}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/90"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {contributedToSubmissions.map((submission: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{submission}</span>
              <button
                type="button"
                onClick={() => removeSubmission(submission)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          {contributedToSubmissions.length === 0 && (
            <p className="text-sm text-zinc-500 italic">No submissions recorded</p>
          )}
        </div>
      </div>

      {/* Willing to be Case Study */}
      <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("ijfParticipation.willingToBeCaseStudy")}
            className="w-5 h-5 mt-1"
          />
          <div>
            <span className="block font-medium text-zinc-900 dark:text-zinc-100">
              Willing to be a Case Study
            </span>
            <span className="block text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Member has agreed to be featured as a case study in reports and advocacy materials
            </span>
          </div>
        </label>
      </div>

      {/* Internal Notes */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Internal Notes (Admin Only)
        </label>
        <textarea
          {...register("ijfParticipation.internalNotes")}
          rows={6}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          placeholder="Private notes visible only to administrators..."
        />
        <p className="text-xs text-zinc-500 mt-1">
          These notes are completely private and will never be visible to the member or in public profiles
        </p>
      </div>
    </div>
  );
}