export const requirementStatuses = ['PENDING', 'CHANGES_REQUESTED', 'APPROVED'] as const;
export type RequirementStatus = (typeof requirementStatuses)[number];

export interface Requirement {
  id: string;
  leadId?: string | null;
  projectId?: string | null;
  businessName: string;
  businessType: string;
  targetAudience: string;
  goals: string;
  requiredFeatures: string[];
  preferredTech: string[];
  additionalNotes?: string | null;
  attachment?: RequirementAttachment | null;
  status: RequirementStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  remarks?: string | null;
  lastUpdatedBy?: string | null;
  lastUpdatedAt?: string | null;
  referenceWebsites?: string[] | null;
  logoUrl?: string | null;
  deadline?: string | null;
  budgetRange?: string | null;
  history: RequirementHistoryEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface RequirementAttachment {
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface RequirementHistoryEvent {
  action: string;
  actorId?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  timestamp: string;
}

export interface RequirementCreate {
  leadId?: string;
  projectId?: string;
  businessName: string;
  businessType: string;
  targetAudience: string;
  goals: string;
  requiredFeatures: string[];
  preferredTech: string[];
  additionalNotes?: string;
}

export interface RequirementUpdate {
  businessName?: string;
  businessType?: string;
  targetAudience?: string;
  goals?: string;
  requiredFeatures?: string[];
  preferredTech?: string[];
  referenceWebsites?: string[];
  logoUrl?: string;
  deadline?: string;
  budgetRange?: string;
  additionalNotes?: string;
}
