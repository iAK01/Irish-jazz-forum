// /lib/googledrive.ts
// Google Drive helper functions for folder and file operations

import { Readable } from "stream";
import { google, drive_v3 } from "googleapis";

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

let driveClient: drive_v3.Drive | null = null;

export function getDriveClient() {
  if (driveClient) return driveClient;

  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.GOOGLE_DRIVE_PROJECT_ID;

  if (!clientEmail || !privateKey) {
    throw new Error('GOOGLE_DRIVE_CLIENT_EMAIL or GOOGLE_DRIVE_PRIVATE_KEY not set');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
      project_id: projectId,
    },
    scopes: SCOPES,
  });

  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

async function findFolder(name: string, parentId: string): Promise<string | null> {
  const drive = getDriveClient();
  
  const response = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return response.data.files?.[0]?.id || null;
}

async function createFolder(name: string, parentId: string): Promise<string> {
  const drive = getDriveClient();
  
  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
    supportsAllDrives: true,
  });

  return response.data.id!;
}

export async function ensureFolderStructure() {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  console.log('=== FOLDER STRUCTURE CHECK ===');
  console.log('Root Folder ID:', rootFolderId);

  if (!rootFolderId) {
    throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID not set');
  }

  // Check if "Forum" folder exists
  let forumFolderId = await findFolder('Forum', rootFolderId);
  console.log('Forum folder ID:', forumFolderId);
  if (!forumFolderId) {
    console.log('Creating Forum folder...');
    forumFolderId = await createFolder('Forum', rootFolderId);
    console.log('Created Forum folder:', forumFolderId);
  }

  // Check if "Working Groups" folder exists under Forum
  let workingGroupsFolderId = await findFolder('Working Groups', forumFolderId);
  console.log('Working Groups folder ID:', workingGroupsFolderId);
  if (!workingGroupsFolderId) {
    console.log('Creating Working Groups folder...');
    workingGroupsFolderId = await createFolder('Working Groups', forumFolderId);
    console.log('Created Working Groups folder:', workingGroupsFolderId);
  }

  console.log('=== FINAL WORKING GROUPS PARENT ID:', workingGroupsFolderId, '===');
  return workingGroupsFolderId;
}

export async function createWorkingGroupFolder(groupName: string): Promise<string> {
  console.log('=== CREATE WORKING GROUP FOLDER ===');
  console.log('Group name:', groupName);
  
  const workingGroupsParentId = await ensureFolderStructure();
  
  console.log('Looking for existing folder:', groupName, 'in parent:', workingGroupsParentId);
  const existingId = await findFolder(groupName, workingGroupsParentId);
  
  if (existingId) {
    console.log('Found existing folder:', existingId);
    return existingId;
  }

  console.log('Creating new folder:', groupName);
  const newId = await createFolder(groupName, workingGroupsParentId);
  console.log('Created folder with ID:', newId);
  return newId;
}

export async function uploadFileToDrive(
  file: Buffer,
  filename: string,
  mimetype: string,
  folderId: string
): Promise<string> {
  const drive = getDriveClient();
  
  console.log('=== UPLOAD FILE ===');
  console.log('Filename:', filename);
  console.log('Target folder ID:', folderId);
  console.log('File size:', file.length, 'bytes');

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType: mimetype,
      body: Readable.from(file),
    },
    fields: 'id, webViewLink',
    supportsAllDrives: true,
  });

  const fileId = response.data.id;

  if (!fileId) {
    throw new Error("Drive upload did not return a file id");
  }

  console.log('File created with ID:', fileId);

  // Make file accessible to anyone with link
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
    supportsAllDrives: true,
  });

  console.log('Permissions set successfully');
  console.log('=== UPLOAD COMPLETE ===');

  return response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
}

export async function createGoogleDocInFolder(
  title: string,
  folderId: string
): Promise<{ id: string; title: string; url: string }> {
  const drive = getDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: "application/vnd.google-apps.document",
      parents: [folderId],
    },
    fields: "id, name, webViewLink",
    supportsAllDrives: true,
  });

  const id = response.data.id;
  const name = response.data.name || title;

  if (!id) {
    throw new Error("Failed to create Google Doc");
  }

  return {
    id,
    title: name,
    url:
      response.data.webViewLink ||
      `https://docs.google.com/document/d/${id}/edit`,
  };
}

/**
 * Rename a Google Drive folder
 * @param folderId - The ID of the folder to rename
 * @param newName - The new name for the folder
 */
export async function renameFolder(folderId: string, newName: string): Promise<void> {
  const drive = getDriveClient();
  
  await drive.files.update({
    fileId: folderId,
    requestBody: { name: newName },
    supportsAllDrives: true,
  });
}

/**
 * Create or find "Deleted Attachments" subfolder within a working group folder
 * @param workingGroupFolderId - The parent working group folder ID
 * @returns The ID of the "Deleted Attachments" folder
 */
export async function createDeletedAttachmentsFolder(workingGroupFolderId: string): Promise<string> {
  const existingId = await findFolder('Deleted Attachments', workingGroupFolderId);
  if (existingId) return existingId;
  
  return await createFolder('Deleted Attachments', workingGroupFolderId);
}

/**
 * Move a file from one folder to another in Google Drive
 * @param fileId - The ID of the file to move
 * @param newParentId - The ID of the destination folder
 */
export async function moveFileToFolder(fileId: string, newParentId: string): Promise<void> {
  const drive = getDriveClient();
  
  // Get current parents
  const file = await drive.files.get({
    fileId: fileId,
    fields: 'parents',
    supportsAllDrives: true,
  });
  
  const previousParents = file.data.parents?.join(',');
  
  // Move file
  await drive.files.update({
    fileId: fileId,
    addParents: newParentId,
    removeParents: previousParents,
    supportsAllDrives: true,
  });
}

/**
 * Delete a folder from Google Drive (moves to trash)
 * @param folderId - The ID of the folder to delete
 */
export async function deleteFolder(folderId: string): Promise<void> {
  const drive = getDriveClient();
  
  await drive.files.delete({
    fileId: folderId,
    supportsAllDrives: true,
  });
}
