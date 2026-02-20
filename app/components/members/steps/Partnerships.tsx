// Location: app/components/members/steps/Partnerships.tsx

"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import RepeatableTable from "../shared/RepeatableTable";

interface PartnershipsProps {
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const IJF_GREEN = "#4CBB5A";

const chipStyle: React.CSSProperties = {
  backgroundColor: IJF_GREEN,
  color: "white",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "6px 14px",
  borderRadius: "9999px",
  fontSize: "14px",
  fontWeight: 500,
};

const addBtnStyle: React.CSSProperties = {
  flexShrink: 0,
  backgroundColor: IJF_GREEN,
  color: "white",
  padding: "8px 20px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "8px 16px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
};

export default function Partnerships({ watch, setValue }: PartnershipsProps) {
  const regularCollaborators = watch("partnerships.regularCollaborators") || [];
  const projectHistory = watch("partnerships.projectHistory") || [];
  const networkMemberships = watch("partnerships.networkMemberships") || [];

  const addItem = (inputId: string, current: string[], field: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input && input.value.trim()) {
      const val = input.value.trim();
      if (!current.includes(val)) setValue(field, [...current, val]);
      input.value = "";
    }
  };

  const removeItem = (field: string, current: string[], value: string) => {
    setValue(field, current.filter((v: string) => v !== value));
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
      <h2 className="text-2xl font-bold text-ijf-accent">Partnerships & Collaboration</h2>

      {/* Regular Collaborators */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">Regular Collaborators</label>
        <p className="text-xs text-zinc-500 mb-2">Enter member slugs or organisation names</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="collaborator-input" type="text" style={inputStyle} placeholder="e.g., dublin-big-band"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("collaborator-input", regularCollaborators, "partnerships.regularCollaborators"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("collaborator-input", regularCollaborators, "partnerships.regularCollaborators")}>Add</button>
        </div>
        {regularCollaborators.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {regularCollaborators.map((c: string) => (
              <span key={c} style={chipStyle}>
                {c}
                <button type="button" onClick={() => removeItem("partnerships.regularCollaborators", regularCollaborators, c)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Project History */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 mb-3">Project History</h3>
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
        <label className="block text-sm font-semibold text-zinc-700 mb-1">Network Memberships</label>
        <p className="text-xs text-zinc-500 mb-2">e.g., Jazz Promotion Network, Better Live, Europe Jazz Network</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="network-input" type="text" style={inputStyle} placeholder="e.g., Jazz Promotion Network"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("network-input", networkMemberships, "partnerships.networkMemberships"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("network-input", networkMemberships, "partnerships.networkMemberships")}>Add</button>
        </div>
        {networkMemberships.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {networkMemberships.map((n: string) => (
              <span key={n} style={chipStyle}>
                {n}
                <button type="button" onClick={() => removeItem("partnerships.networkMemberships", networkMemberships, n)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}