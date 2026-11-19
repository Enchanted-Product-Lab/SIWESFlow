
export type ActivityStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested";

export type EngagementStatus =
  | "ACTIVE"
  | "AT_RISK"
  | "INACTIVE";

export interface Student {
  id: string;
  name: string;
  matricNumber: string;
  university: string;
  department: string;
  level: string;
  placementCompany: string;
  engagementStatus?: EngagementStatus;
  placementStatus?: string;
  verificationStatus?: string;
  avatarUrl?: string;
}

export interface ActivityLog {
  id: string;
  studentId: string;
  date: string;
  title: string;
  description: string;
  hoursWorked: number;
  skillsAcquired: string[];
  evidenceUrls: string[];
  status: ActivityStatus;
  supervisorFeedback?: string;
}
