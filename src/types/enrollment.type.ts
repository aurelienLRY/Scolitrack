import { 
  EnrollmentCampaign, 
  EnrollmentFile, 
  EnrollmentStudent, 
  EnrollmentHistory, 
  EnrollmentStatus,
  User,
  Family,
  Student
} from "@prisma/client";

// Types de base pour les campagnes d'inscription
export interface EnrollmentCampaignComplete extends EnrollmentCampaign {
  creator: User;
  enrollmentFiles: EnrollmentFileWithDetails[];
  _count: {
    enrollmentFiles: number;
  };
}

export interface EnrollmentCampaignWithStats extends EnrollmentCampaign {
  creator: User;
  stats: {
    totalFiles: number;
    submittedFiles: number;
    approvedFiles: number;
    rejectedFiles: number;
    pendingFiles: number;
  };
}

// Types pour les dossiers d'inscription
export interface EnrollmentFileWithDetails extends EnrollmentFile {
  campaign: EnrollmentCampaign;
  family?: FamilyWithMembers;
  reviewer?: User;
  students: EnrollmentStudentWithStudent[];
  history: EnrollmentHistoryWithActor[];
}

export interface EnrollmentFileWithStats extends EnrollmentFile {
  campaign: {
    id: string;
    name: string;
  };
  family?: {
    id: string;
    name: string;
  };
  students: Array<{
    student: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  _count: {
    students: number;
  };
}

// Types pour les étudiants dans les dossiers
export interface EnrollmentStudentWithStudent extends EnrollmentStudent {
  student: Student;
}

// Types pour l'historique
export interface EnrollmentHistoryWithActor extends EnrollmentHistory {
  actor?: User;
}

// Types pour les familles
export interface FamilyWithMembers extends Family {
  members: Array<{
    user: User;
    relationship: string;
    isMainAddress: boolean;
  }>;
}

// Types pour les formulaires
export interface CreateEnrollmentCampaignData {
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateEnrollmentCampaignData {
  name?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateEnrollmentFileData {
  campaignId: string;
  familyId?: string;
  email: string;
}

export interface UpdateEnrollmentFileData {
  familyId?: string;
  status?: EnrollmentStatus;
  decisionNote?: string;
}

export interface UpdateEnrollmentStatusData {
  status: EnrollmentStatus;
  note?: string;
}

export interface AddStudentToEnrollmentData {
  studentId: string;
}

export interface GenerateEnrollmentFilesData {
  emails: string[];
}

// Types pour les filtres et requêtes
export interface EnrollmentCampaignFilters {
  status?: "active" | "upcoming" | "past";
  creatorId?: string;
}

export interface EnrollmentFileFilters {
  status?: EnrollmentStatus;
  campaignId?: string;
  familyId?: string;
  email?: string;
}

// Types pour les statistiques
export interface EnrollmentStats {
  totalFiles: number;
  submittedFiles: number;
  approvedFiles: number;
  rejectedFiles: number;
  pendingFiles: number;
  needInfoFiles: number;
}

export interface MonthlyEnrollmentStats {
  month: string;
  submitted: number;
  approved: number;
  rejected: number;
  needInfo: number;
}

// Types pour les réponses API
export interface EnrollmentCampaignResponse {
  campaign: EnrollmentCampaignComplete;
}

export interface EnrollmentCampaignsResponse {
  campaigns: EnrollmentCampaignComplete[];
}

export interface EnrollmentFileResponse {
  file: EnrollmentFileWithDetails;
}

export interface EnrollmentFilesResponse {
  files: EnrollmentFileWithDetails[];
}

export interface EnrollmentStatsResponse {
  stats: EnrollmentStats;
  monthlyStats: MonthlyEnrollmentStats[];
}

// Types pour les mutations
export interface GenerateFilesResponse {
  count: number;
  files: EnrollmentFileWithDetails[];
}
