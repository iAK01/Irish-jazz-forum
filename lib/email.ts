// /lib/email.ts

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, from, replyTo }: EmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: from || process.env.SMTP_FROM || 'Irish Jazz Forum <hello@mg.irishjazzforum.com>',
    to: Array.isArray(to) ? to.join(', ') : to,
    replyTo,
    subject,
    html,
  });

  return info;
}

export async function sendInvitationEmail(params: {
  to: string;
  inviterName: string;
  invitationLink: string;
  expiryDate: string;
  personalMessage?: string;
}) {
  const { generateInvitationEmail, generateInvitationSubject } = await import(
    '@/lib/email-templates/invitation'
  );

  const html = generateInvitationEmail({
    inviterName: params.inviterName,
    invitationLink: params.invitationLink,
    expiryDate: params.expiryDate,
    personalMessage: params.personalMessage,
  });

  const subject = generateInvitationSubject(params.inviterName);

  return sendEmail({ to: params.to, subject, html });
}

export async function sendMemberPendingEmail(params: {
  to: string;
  adminName: string;
  memberName: string;
  memberEmail: string;
  memberType: string;
  reviewLink: string;
}) {
  const { generateMemberPendingEmail, generateMemberPendingSubject } = await import(
    '@/lib/email-templates/member-pending'
  );

  const html = generateMemberPendingEmail({
    adminName: params.adminName,
    memberName: params.memberName,
    memberEmail: params.memberEmail,
    memberType: params.memberType,
    reviewLink: params.reviewLink,
  });

  const subject = generateMemberPendingSubject(params.memberName);

  return sendEmail({ to: params.to, subject, html });
}

export async function sendMemberApprovedEmail(params: {
  to: string;
  memberName: string;
  dashboardLink: string;
}) {
  const { generateMemberApprovedEmail, generateMemberApprovedSubject } = await import(
    '@/lib/email-templates/member-approved'
  );

  const html = generateMemberApprovedEmail({
    memberName: params.memberName,
    dashboardLink: params.dashboardLink,
  });

  const subject = generateMemberApprovedSubject();

  return sendEmail({ to: params.to, subject, html });
}

export async function sendMemberRejectedEmail(params: {
  to: string;
  memberName: string;
  reason?: string;
}) {
  const { generateMemberRejectedEmail, generateMemberRejectedSubject } = await import(
    '@/lib/email-templates/member-rejected'
  );

  const html = generateMemberRejectedEmail({
    memberName: params.memberName,
    reason: params.reason,
  });

  const subject = generateMemberRejectedSubject();

  return sendEmail({ to: params.to, subject, html });
}

export async function sendMentionNotificationEmail(params: {
  to: string;
  mentionedName: string;
  mentionerName: string;
  threadTitle: string;
  threadUrl: string;
}) {
  const {
    generateMentionNotificationEmail,
    generateMentionNotificationSubject,
  } = await import('@/lib/email-templates/mention-notification');

  const html = generateMentionNotificationEmail({
    mentionedName: params.mentionedName,
    mentionerName: params.mentionerName,
    threadTitle: params.threadTitle,
    threadUrl: params.threadUrl,
  });

  const subject = generateMentionNotificationSubject(
    params.mentionerName,
    params.threadTitle
  );

  return sendEmail({
    to: params.to,
    subject,
    html,
    from: 'Irish Jazz Forum <hello@irishjazzforum.com>',
  });
}

export async function sendForumDigestEmail(params: {
  to: string;
  payload: import("@/lib/forumDigest").ForumDigestPayload;
}) {
  const {
    generateForumDigestEmail,
    generateForumDigestSubject,
  } = await import("@/lib/email-templates/forum-digest");

  return sendEmail({
    to: params.to,
    subject: generateForumDigestSubject(params.payload),
    html: generateForumDigestEmail(params.payload),
    from: "Irish Jazz Forum <hello@irishjazzforum.com>",
  });
}
