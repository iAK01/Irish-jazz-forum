// Location: app/components/members/steps/Funding.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import RepeatableTable from "../shared/RepeatableTable";

interface FundingProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export default function Funding({ register, watch, setValue }: FundingProps) {
  const artsCouncilGrants = watch("fundingHistory.artsCouncilGrants") || [];
  const localAuthoritySupport = watch("fundingHistory.localAuthoritySupport") || [];
  const cultureIrelandSupport = watch("fundingHistory.cultureIrelandSupport") || [];
  const privateSponsorship = watch("fundingHistory.privateSponsorship") || [];

  // Arts Council Grants
  const addArtsCouncilGrant = () => {
    setValue("fundingHistory.artsCouncilGrants", [
      ...artsCouncilGrants,
      { year: new Date().getFullYear(), amount: 0, scheme: "", successful: true },
    ]);
  };

  const removeArtsCouncilGrant = (index: number) => {
    setValue(
      "fundingHistory.artsCouncilGrants",
      artsCouncilGrants.filter((_: any, i: number) => i !== index)
    );
  };

  const updateArtsCouncilGrant = (index: number, field: string, value: any) => {
    const updated = [...artsCouncilGrants];
    updated[index] = { ...updated[index], [field]: value };
    setValue("fundingHistory.artsCouncilGrants", updated);
  };

  // Local Authority Support
  const addLocalAuthority = () => {
    setValue("fundingHistory.localAuthoritySupport", [
      ...localAuthoritySupport,
      { authority: "", year: new Date().getFullYear(), amount: 0, scheme: "" },
    ]);
  };

  const removeLocalAuthority = (index: number) => {
    setValue(
      "fundingHistory.localAuthoritySupport",
      localAuthoritySupport.filter((_: any, i: number) => i !== index)
    );
  };

  const updateLocalAuthority = (index: number, field: string, value: any) => {
    const updated = [...localAuthoritySupport];
    updated[index] = { ...updated[index], [field]: value };
    setValue("fundingHistory.localAuthoritySupport", updated);
  };

  // Culture Ireland Support
  const addCultureIreland = () => {
    setValue("fundingHistory.cultureIrelandSupport", [
      ...cultureIrelandSupport,
      { year: new Date().getFullYear(), amount: 0, destination: "" },
    ]);
  };

  const removeCultureIreland = (index: number) => {
    setValue(
      "fundingHistory.cultureIrelandSupport",
      cultureIrelandSupport.filter((_: any, i: number) => i !== index)
    );
  };

  const updateCultureIreland = (index: number, field: string, value: any) => {
    const updated = [...cultureIrelandSupport];
    updated[index] = { ...updated[index], [field]: value };
    setValue("fundingHistory.cultureIrelandSupport", updated);
  };

  // Private Sponsorship
  const addPrivateSponsorship = () => {
    setValue("fundingHistory.privateSponsorship", [
      ...privateSponsorship,
      { sponsor: "", year: new Date().getFullYear(), amount: 0, inkind: "" },
    ]);
  };

  const removePrivateSponsorship = (index: number) => {
    setValue(
      "fundingHistory.privateSponsorship",
      privateSponsorship.filter((_: any, i: number) => i !== index)
    );
  };

  const updatePrivateSponsorship = (index: number, field: string, value: any) => {
    const updated = [...privateSponsorship];
    updated[index] = { ...updated[index], [field]: value };
    setValue("fundingHistory.privateSponsorship", updated);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ijf-accent mb-4">Funding & Economic Impact</h2>

      {/* Arts Council Grants */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Arts Council Grants
        </h3>
        <RepeatableTable
          fields={[
            { name: "year", label: "Year", type: "number", required: true },
            { name: "amount", label: "Amount (€)", type: "number", required: true },
            { name: "scheme", label: "Scheme", type: "text", required: true },
            { name: "successful", label: "Successful", type: "boolean" },
          ]}
          data={artsCouncilGrants}
          onAdd={addArtsCouncilGrant}
          onRemove={removeArtsCouncilGrant}
          onChange={updateArtsCouncilGrant}
          addButtonText="Add Grant"
        />
      </div>

      {/* Local Authority Support */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Local Authority Support
        </h3>
        <RepeatableTable
          fields={[
            { name: "authority", label: "Authority", type: "text", required: true, placeholder: "e.g., Dublin City Council" },
            { name: "year", label: "Year", type: "number", required: true },
            { name: "amount", label: "Amount (€)", type: "number", required: true },
            { name: "scheme", label: "Scheme", type: "text", placeholder: "Optional" },
          ]}
          data={localAuthoritySupport}
          onAdd={addLocalAuthority}
          onRemove={removeLocalAuthority}
          onChange={updateLocalAuthority}
          addButtonText="Add Support"
        />
      </div>

      {/* Culture Ireland Support */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Culture Ireland Support
        </h3>
        <RepeatableTable
          fields={[
            { name: "year", label: "Year", type: "number", required: true },
            { name: "amount", label: "Amount (€)", type: "number", required: true },
            { name: "destination", label: "Destination", type: "text", placeholder: "Optional" },
          ]}
          data={cultureIrelandSupport}
          onAdd={addCultureIreland}
          onRemove={removeCultureIreland}
          onChange={updateCultureIreland}
          addButtonText="Add Support"
        />
      </div>

      {/* Private Sponsorship */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Private Sponsorship
        </h3>
        <RepeatableTable
          fields={[
            { name: "sponsor", label: "Sponsor", type: "text", required: true },
            { name: "year", label: "Year", type: "number", required: true },
            { name: "amount", label: "Amount (€)", type: "number", placeholder: "Optional" },
            { name: "inkind", label: "In-Kind", type: "text", placeholder: "Optional" },
          ]}
          data={privateSponsorship}
          onAdd={addPrivateSponsorship}
          onRemove={removePrivateSponsorship}
          onChange={updatePrivateSponsorship}
          addButtonText="Add Sponsorship"
        />
      </div>

      {/* Economic Impact */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
          Economic Impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Estimated Annual Value (€)
            </label>
            <input
              type="number"
              {...register("economicImpact.estimatedAnnualValue", { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Local Employment Supported
            </label>
            <input
              type="number"
              {...register("economicImpact.localEmploymentSupported", { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tourist Engagement Estimate
            </label>
            <input
              type="number"
              {...register("economicImpact.touristEngagementEstimate", { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}