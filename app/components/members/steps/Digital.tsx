// Location: app/components/members/steps/Digital.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface DigitalProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const SURVEY_CHANNELS = [
  { value: "email_lists", label: "Email Lists" },
  { value: "at_venue_qr", label: "At Venue QR Codes" },
  { value: "social_media", label: "Social Media" },
  { value: "website", label: "Website" },
];

export default function Digital({ register, watch, setValue }: DigitalProps) {
  const ticketingSystems = watch("ticketingSystemsUsed") || [];
  const crmTools = watch("crmOrMailingTools") || [];
  const analyticsTools = watch("analyticsTools") || [];
  const surveyChannels = watch("preferredSurveyChannels") || [];

  const addTicketingSystem = () => {
    const input = document.getElementById("ticketing-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newSystem = input.value.trim();
      if (!ticketingSystems.includes(newSystem)) {
        setValue("ticketingSystemsUsed", [...ticketingSystems, newSystem]);
      }
      input.value = "";
    }
  };

  const removeTicketingSystem = (system: string) => {
    setValue("ticketingSystemsUsed", ticketingSystems.filter((s: string) => s !== system));
  };

  const addCRMTool = () => {
    const input = document.getElementById("crm-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newTool = input.value.trim();
      if (!crmTools.includes(newTool)) {
        setValue("crmOrMailingTools", [...crmTools, newTool]);
      }
      input.value = "";
    }
  };

  const removeCRMTool = (tool: string) => {
    setValue("crmOrMailingTools", crmTools.filter((t: string) => t !== tool));
  };

  const addAnalyticsTool = () => {
    const input = document.getElementById("analytics-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newTool = input.value.trim();
      if (!analyticsTools.includes(newTool)) {
        setValue("analyticsTools", [...analyticsTools, newTool]);
      }
      input.value = "";
    }
  };

  const removeAnalyticsTool = (tool: string) => {
    setValue("analyticsTools", analyticsTools.filter((t: string) => t !== tool));
  };

  const toggleSurveyChannel = (channel: string) => {
    const current = surveyChannels;
    if (current.includes(channel)) {
      setValue("preferredSurveyChannels", current.filter((c: string) => c !== channel));
    } else {
      setValue("preferredSurveyChannels", [...current, channel]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Digital Capacity</h2>

      {/* Ticketing Systems */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Ticketing Systems Used
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id="ticketing-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., Eventbrite, Ticketsolve"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTicketingSystem();
              }
            }}
          />
          <button
            type="button"
            onClick={addTicketingSystem}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ticketingSystems.map((system: string) => (
            <span
              key={system}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {system}
              <button
                type="button"
                onClick={() => removeTicketingSystem(system)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* CRM/Mailing Tools */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          CRM or Mailing Tools
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id="crm-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., Mailchimp, HubSpot"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCRMTool();
              }
            }}
          />
          <button
            type="button"
            onClick={addCRMTool}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {crmTools.map((tool: string) => (
            <span
              key={tool}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {tool}
              <button
                type="button"
                onClick={() => removeCRMTool(tool)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Analytics Tools */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Analytics Tools
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id="analytics-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., Google Analytics"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAnalyticsTool();
              }
            }}
          />
          <button
            type="button"
            onClick={addAnalyticsTool}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {analyticsTools.map((tool: string) => (
            <span
              key={tool}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {tool}
              <button
                type="button"
                onClick={() => removeAnalyticsTool(tool)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Data Consent */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("consentToShareAggregatedData")}
            className="w-4 h-4"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Consent to Share Aggregated Data
          </span>
        </label>
      </div>

      {/* Preferred Survey Channels */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Preferred Survey Channels
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SURVEY_CHANNELS.map((channel) => {
            const isSelected = surveyChannels.includes(channel.value);
            return (
              <label
                key={channel.value}
                className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSurveyChannel(channel.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {channel.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}