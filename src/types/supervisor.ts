export type ActivityStatus = 'PENDING' | 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';

export interface ActivityEvidence {
  id: string;
  fileUrl: string;
  fileType: 'image/jpeg' | 'image/png' | 'application/pdf';
  fileName: string;
  fileSizeMB: number;
}

export interface StudentActivityLog {
  id: string;
  studentId: string;
  studentName: string;
  studentMatric: string;
  department: string;
  date: string;
  title: string;
  category: string;
  hoursWorked: number;
  skillsUsed: string[];
  description: string;
  whatILearned: string;
  challenges: string;
  status: ActivityStatus;
  evidence?: ActivityEvidence[];
  supervisorFeedback?: {
    comment: string;
    rating?: number;
    reviewedAt: string;
    actionTaken: ActivityStatus;
  };
}

export interface ReviewActionPayload {
  activityId: string;
  action: ActivityStatus;
  comment: string;
  rating?: number;
  flagStudent?: boolean;
  flagReason?: string;
}