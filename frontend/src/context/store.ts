import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActivityEvent {
  id: string;
  type: 'skill' | 'roadmap' | 'interview' | 'resume' | 'intelligence';
  description: string;
  impactScore: number;
  timestamp: string;
}

interface IntelligenceState {
  readinessScore: number;
  marketAlignment: number;
  skillProficiency: Record<string, number>;
  activeGaps: string[];
  recentActivities: ActivityEvent[];
  
  // Actions
  updateReadiness: (score: number) => void;
  setSkillLevel: (skill: string, level: number) => void;
  addActivity: (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  clearIntelligence: () => void;
}

export const useIntelligenceStore = create<IntelligenceState>()(
  persist(
    (set) => ({
      readinessScore: 0,
      marketAlignment: 0,
      skillProficiency: {},
      activeGaps: [],
      recentActivities: [],

      updateReadiness: (score) => set({ readinessScore: score }),
      
      setSkillLevel: (skill, level) => set((state) => ({
        skillProficiency: { ...state.skillProficiency, [skill]: level }
      })),

      addActivity: (activity) => set((state) => ({
        recentActivities: [
          {
            ...activity,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
          },
          ...state.recentActivities
        ].slice(0, 50) // Keep last 50
      })),

      clearIntelligence: () => set({
        readinessScore: 0,
        marketAlignment: 0,
        skillProficiency: {},
        activeGaps: [],
        recentActivities: []
      })
    }),
    {
      name: 'sm-intelligence-storage',
    }
  )
);
