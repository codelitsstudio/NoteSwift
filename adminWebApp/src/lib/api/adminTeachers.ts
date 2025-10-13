"use client";

export type TeacherSummary = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  institution?: { name?: string; type?: string };
  subjects?: Array<{ name: string; level?: string }>;
  qualifications?: Array<any>;
  onboardingStep?: string;
  onboardingComplete?: boolean;
  createdAt?: string;
  phoneNumber?: string;
  dateOfBirth?: string | Date;
  gender?: string;
  experience?: {
    totalYears?: number;
    previousPositions?: Array<{ title?: string; institution?: string; startDate?: string; endDate?: string; description?: string }>;
  };
  verificationDocuments?: {
    profile?: Array<{ name?: string; mimeType?: string; url?: string; publicId?: string; size?: number; uploadedAt?: string; }>;
  };
};

export async function fetchPendingTeachers(): Promise<TeacherSummary[]> {
  // Call local admin API which reads the shared teachers collection directly
  const res = await fetch(`/api/teachers?status=pending_approval`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch pending teachers');
  const json = await res.json();
  return json.data?.teachers || [];
}

export async function approveTeacher(id: string, notify = true) {
  const res = await fetch(`/api/teachers/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notify }) });
  if (!res.ok) throw new Error('Failed to approve teacher');
  return res.json();
}

export async function fetchApprovedTeachers(): Promise<TeacherSummary[]> {
  const res = await fetch(`/api/teachers?status=approved`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch approved teachers');
  const json = await res.json();
  return json.data?.teachers || [];
}

export async function fetchRejectedTeachers(): Promise<TeacherSummary[]> {
  const res = await fetch(`/api/teachers?status=rejected`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch rejected teachers');
  const json = await res.json();
  return json.data?.teachers || [];
}

export async function removeTeacher(id: string, reason?: string, notify = true) {
  const res = await fetch(`/api/teachers/${id}/remove`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason, notify }) });
  if (!res.ok) throw new Error('Failed to remove teacher');
  return res.json();
}

export async function rejectTeacher(id: string, reason?: string, notify = true) {
  const res = await fetch(`/api/teachers/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason, notify }) });
  if (!res.ok) throw new Error('Failed to reject teacher');
  return res.json();
}