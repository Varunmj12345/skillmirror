export interface User {
  id: number;
  username: string;
  email: string;
  skills: Skill[];
}

export interface Skill {
  id: number;
  name: string;
  proficiency: string;
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