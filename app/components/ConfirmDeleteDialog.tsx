// /app/components/ConfirmDeleteDialog.tsx
// Two-step confirmation dialog for destructive operations

"use client";

import { useState } from "react";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  counts?: {
    threads?: number;
    posts?: number;
    gcsFiles?: number;
    driveFiles?: number;
  };
  isLoading?: boolean;
}

export default function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  counts,
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const canConfirm = confirmText === "DELETE";

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const handleConfirm = () => {
    if (canConfirm && !isLoading) {
      onConfirm();
      setConfirmText("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">{message}</p>

          <div className="bg-gray-50 rounded-md p-3 mb-3">
            <p className="text-sm font-medium text-gray-900 mb-2">
              Item: <span className="text-red-600">{itemName}</span>
            </p>

            {counts && (
              <div className="text-sm text-gray-600 space-y-1">
                {counts.threads !== undefined && counts.threads > 0 && (
                  <p>• {counts.threads} thread{counts.threads !== 1 ? "s" : ""} will be deleted</p>
                )}
                {counts.posts !== undefined && counts.posts > 0 && (
                  <p>• {counts.posts} post{counts.posts !== 1 ? "s" : ""} will be deleted</p>
                )}
                {counts.gcsFiles !== undefined && counts.gcsFiles > 0 && (
                  <p>• {counts.gcsFiles} file{counts.gcsFiles !== 1 ? "s" : ""} will be permanently deleted from storage</p>
                )}
                {counts.driveFiles !== undefined && counts.driveFiles > 0 && (
                  <p>• {counts.driveFiles} Drive file{counts.driveFiles !== 1 ? "s" : ""} will be moved to Deleted Attachments</p>
                )}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">
            This action can be undone within 7 days. After that, all data will be permanently deleted.
          </p>

          <p className="text-sm font-medium text-gray-700 mb-2">
            Type <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-red-600">DELETE</span> to confirm:
          </p>

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            disabled={isLoading}
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
              canConfirm && !isLoading
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-300 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}