import { projects, results, users } from './data';
import type { Project, UserProfile, VoterCategory } from './types';

const wait = (ms = 450) => new Promise(resolve => setTimeout(resolve, ms));
export const mockServices = {
  async loginWithGoogle(): Promise<UserProfile> { await wait(500); return users[0]; },
  async getProjects(): Promise<Project[]> { await wait(350); return projects; },
  async getCurrentUser(): Promise<UserProfile> { await wait(200); return users[0]; },
  async saveVoterCategory(category: VoterCategory) { await wait(300); localStorage.setItem('exhibition-category', category); return category; },
  async submitVote(projectId: string) { await wait(1000); localStorage.setItem('exhibition-voted', projectId); return { projectId, receipt: `NS-${Date.now().toString(36).toUpperCase()}` }; },
  async getVotingResults() { await wait(300); return results; },
  async createProject(data: Omit<Project, 'id'>) { await wait(550); return { ...data, id: `p${Date.now()}` }; },
  async updateProject(id: string, data: Partial<Project>) { await wait(450); return { id, ...data }; },
  async archiveProject(id: string) { await wait(400); return id; },
};
