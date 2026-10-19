export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  name?: string;
  skills?: Skill[];
  dream_job?: string;
  domain?: string;
  experience_level?: string;
}

export interface AuthUser extends User {
  '2fa_required'?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role?: string;
  dream_job?: string;
  domain?: string;
  experience_level?: string;
  [key: string]: any;
}

export interface TwoFactorPayload {
  email: string;
  code: string;
}

export interface Skill {
  id: number;
  name: string;
  proficiency: string;
  level?: number;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
}

export interface CareerRoadmap {
  id: number;
  title: string;
  steps: RoadmapStep[];
}

export interface RoadmapStep {
  id: number;
  skill: Skill;
  resources: string[];
}

export interface SkillAnalysis {
  skill: Skill;
  gap: number;
  recommendations: string[];
}

export interface Problem {
  id: string | number;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
  xp_reward?: number;
  starter_code?: string;
}

export interface ATSScoreResult {
  score: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
}