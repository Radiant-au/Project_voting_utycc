import type { ProjectCategory } from './project-categories';

export type VoterCategory = 'student' | 'teacher' | 'visitor';
export type CategoryStatus = 'pending' | 'verified' | 'rejected';

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  category: ProjectCategory;
  teamName: string;
  imageUrl: string;
  isActive: boolean;
  isArchived: boolean;
  features: string[];
}

export interface AdminProject extends Project {
  hiddenProjectCode: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  category: VoterCategory;
  categoryStatus: CategoryStatus;
  hasVoted: boolean;
  registeredAt: string;
  votedAt?: string;
}

export interface ProjectResult {
  projectId: string;
  studentVotes: number;
  teacherVotes: number;
  visitorVotes: number;
  totalVotes: number;
  totalPoints: number;
  rank: number;
}
