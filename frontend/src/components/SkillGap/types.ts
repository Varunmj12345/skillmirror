export interface Skill {
    name: string;
    user?: number;
    user_level?: number;
    required?: number;
    category: string;
    gap_severity?: 'critical' | 'moderate' | 'minor';
    estimated_hours?: number;
}

export interface RoadmapPhase {
    name: string;
    skills: string[];
    is_locked?: boolean;
    dependency?: string;
}

export interface SkillGapReport {
    readiness_score: number;
    technical_score: number;
    soft_skill_score: number;
    matched_skills: Skill[];
    missing_skills: Skill[];
    roadmap?: RoadmapPhase[];
    ai_career_intelligence?: {
        confidence_score: number;
        market_demand: 'High' | 'Medium' | 'Low';
        hiring_trend: number;
        salary_impact: Record<string, number>;
        automation_risk: number;
        job_stability: string;
    };
    readiness_metrics?: {
        readiness_change: number;
        technical_change: number;
        soft_change: number;
        market_average: number;
        percentile: number;
    };
}

export interface Course {
    name: string;
    platform: string;
    level: string;
    url: string;
}

export interface Project {
    name: string;
    difficulty: string;
    description?: string;
}

export interface Certification {
    name: string;
    provider: string;
    difficulty?: string;
    duration?: string;
}

export interface AIRecommendationsData {
    courses: Course[];
    projects: Project[];
    certifications: Certification[];
    estimated_time: string;
    roadmap?: RoadmapPhase[];
}

export interface ActionPlan {
    weekly_breakdown?: { day: string, task: string }[];
    daily_commitment?: number;
    projects?: Project[];
    certifications?: Certification[];
}
