"use client";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "textarea" | "boolean";
  required?: boolean;
  placeholder?: string;
}

interface RepeatableTableProps {
  fields: FieldConfig[];
  data: any[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: any) => void;
  addButtonText?: string;
}

export default function RepeatableTable({
  fields,
  data,
  onAdd,
  onRemove,
  onChange,
  addButtonText = "Add Row",
}: RepeatableTableProps) {
  const renderInput = (field: FieldConfig, rowIndex: number, value: any) => {
    const baseClasses = "px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(rowIndex, field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClasses} w-full min-h-[80px]`}
            required={field.required}
          />
        );
      
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(rowIndex, field.name, e.target.checked)}
            className="w-5 h-5"
          />
        );
      
      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(rowIndex, field.name, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            className={`${baseClasses} w-full`}
            required={field.required}
          />
        );
      
      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(rowIndex, field.name, e.target.value)}
            className={`${baseClasses} w-full`}
            required={field.required}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(rowIndex, field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClasses} w-full`}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800">
              {fields.map((field) => (
                <th
                  key={field.name}
                  className="px-4 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </th>
              ))}
              <th className="px-4 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={fields.length + 1}
                  className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700"
                >
                  No entries yet. Click "{addButtonText}" to get started.
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  {fields.map((field) => (
                    <td
                      key={field.name}
                      className="px-4 py-2 border border-zinc-300 dark:border-zinc-700"
                    >
                      {renderInput(field, rowIndex, row[field.name])}
                    </td>
                  ))}
                  <td className="px-4 py-2 border border-zinc-300 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => onRemove(rowIndex)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="px-4 py-2 bg-ijf-accent text-ijf-bg rounded hover:bg-ijf-accent/80 font-semibold"
      >
        {addButtonText}
      </button>
    </div>
  );
}