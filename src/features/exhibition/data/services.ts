import { projects, results } from './data';
import type { Project } from './types';

const wait = (ms = 450) => new Promise(resolve => setTimeout(resolve, ms));
export const mockServices = {
  async getProjects(): Promise<Project[]> { await wait(350); return projects; },
  async getVotingResults() { await wait(300); return results; },
  async createProject(data: Omit<Project, 'id'>) { await wait(550); return { ...data, id: `p${Date.now()}` }; },
  async updateProject(id: string, data: Partial<Project>) { await wait(450); return { id, ...data }; },
  async archiveProject(id: string) { await wait(400); return id; },
};
