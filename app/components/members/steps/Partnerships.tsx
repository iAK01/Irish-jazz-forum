// Location: app/components/members/steps/Partnerships.tsx

"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import RepeatableTable from "../shared/RepeatableTable";

interface PartnershipsProps {
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export default function Partnerships({ watch, setValue }: PartnershipsProps) {
  const regularCollaborators = watch("partnerships.regularCollaborators") || [];
  const projectHistory = watch("partnerships.projectHistory") || [];
  const networkMemberships = watch("partnerships.networkMemberships") || [];

  const addCollaborator = () => {
    const input = document.getElementById("collaborator-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newCollaborator = input.value.trim();
      if (!regularCollaborators.includes(newCollaborator)) {
        setValue("partnerships.regularCollaborators", [...regularCollaborators, newCollaborator]);
      }
      input.value = "";
    }
  };

  const removeCollaborator = (collaborator: string) => {
    setValue("partnerships.regularCollaborators", regularCollaborators.filter((c: string) => c !== collaborator));
  };

  const addNetworkMembership = () => {
    const input = document.getElementById("network-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newNetwork = input.value.trim();
      if (!networkMemberships.includes(newNetwork)) {
        setValue("partnerships.networkMemberships", [...networkMemberships, newNetwork]);
      }
      input.value = "";
    }
  };

  const removeNetworkMembership = (network: string) => {
    setValue("partnerships.networkMemberships", networkMemberships.filter((n: string) => n !== network));
  };

  const addProject = () => {
    setValue("partnerships.projectHistory", [
      ...projectHistory,
      { partnerSlug: "", projectName: "", year: new Date().getFullYear(), fundingSource: "", description: "" },
    ]);
  };

  const removeProject = (index: number) => {
    setValue("partnerships.projectHistory", projectHistory.filter((_: any, i: number) => i !== index));
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...projectHistory];
    updated[index] = { ...updated[index], [field]: value };
    setValue("partnerships.projectHistory", updated);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Partnerships & Collaboration</h2>

      {/* Regular Collaborators */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Regular Collaborators
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Enter member slugs or organization names
        </p>
        <div className="flex gap-2 mb-2">
          <input
            id="collaborator-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., dublin-big-band"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCollaborator();
              }
            }}
          />
          <button
            type="button"
            onClick={addCollaborator}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {regularCollaborators.map((collaborator: string) => (
            <span
              key={collaborator}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {collaborator}
              <button
                type="button"
                onClick={() => removeCollaborator(collaborator)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Project History */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Project History
        </h3>
        <RepeatableTable
          fields={[
            { name: "partnerSlug", label: "Partner", type: "text", required: true, placeholder: "Member slug or name" },
            { name: "projectName", label: "Project Name", type: "text", required: true },
            { name: "year", label: "Year", type: "number", required: true },
            { name: "fundingSource", label: "Funding Source", type: "text", placeholder: "Optional" },
            { name: "description", label: "Description", type: "textarea", placeholder: "Optional" },
          ]}
          data={projectHistory}
          onAdd={addProject}
          onRemove={removeProject}
          onChange={updateProject}
          addButtonText="Add Project"
        />
      </div>

      {/* Network Memberships */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Network Memberships
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          e.g., Jazz Promotion Network, Better Live, Europe Jazz Network
        </p>
        <div className="flex gap-2 mb-2">
          <input
            id="network-input"
            type="text"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="e.g., Jazz Promotion Network"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNetworkMembership();
              }
            }}
          />
          <button
            type="button"
            onClick={addNetworkMembership}
            className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-medium"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {networkMemberships.map((network: string) => (
            <span
              key={network}
              className="px-3 py-1 bg-ijf-primary text-ijf-surface rounded-full text-sm flex items-center gap-2"
            >
              {network}
              <button
                type="button"
                onClick={() => removeNetworkMembership(network)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}