import { Project } from '@/types';
import { getAllProjects, saveProject } from '../storage';
import { loadProjectsFromCloud, saveProjectToCloud, syncProjectsToCloud } from './projects';
import type { User } from '@supabase/supabase-js';

const STORAGE_KEY = 'knowspark_projects';
const LAST_SYNC_KEY = 'knowspark_last_sync';

export interface SyncResult {
  merged: Project[];
  localCount: number;
  cloudCount: number;
  mergedCount: number;
}

/**
 * Merge local and cloud projects, preferring the most recently updated version
 */
export function mergeProjects(localProjects: Project[], cloudProjects: Project[]): Project[] {
  const projectMap = new Map<string, Project>();

  // Add cloud projects first (they're the source of truth when syncing)
  cloudProjects.forEach(project => {
    projectMap.set(project.id, project);
  });

  // Merge local projects, keeping the one with the latest updatedAt
  localProjects.forEach(localProject => {
    const existing = projectMap.get(localProject.id);
    if (!existing || localProject.updatedAt > existing.updatedAt) {
      projectMap.set(localProject.id, localProject);
    }
  });

  return Array.from(projectMap.values());
}

/**
 * Sync projects between localStorage and Supabase
 */
export async function syncLocalWithCloud(userId: string): Promise<SyncResult> {
  if (!userId) {
    // If no user ID, just return local projects
    const localProjects = getAllProjects();
    return {
      merged: localProjects,
      localCount: localProjects.length,
      cloudCount: 0,
      mergedCount: localProjects.length,
    };
  }

  try {
    // Load from both sources
    const localProjects = getAllProjects();
    let cloudProjects: Project[] = [];
    
    try {
      cloudProjects = await loadProjectsFromCloud(userId);
    } catch (cloudError) {
      console.error('Error loading projects from cloud:', cloudError);
      // Continue with local projects if cloud load fails
    }

    // Merge projects
    const merged = mergeProjects(localProjects, cloudProjects);

    // Save merged projects to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    }

    // Sync merged projects to cloud (don't fail if this errors)
    try {
      await syncProjectsToCloud(userId, merged);
    } catch (syncError) {
      console.error('Error syncing projects to cloud:', syncError);
      // Continue even if sync fails - localStorage is the source of truth
    }

    return {
      merged,
      localCount: localProjects.length,
      cloudCount: cloudProjects.length,
      mergedCount: merged.length,
    };
  } catch (error) {
    console.error('Error syncing projects:', error);
    // On error, return local projects as fallback
    const localProjects = getAllProjects();
    return {
      merged: localProjects,
      localCount: localProjects.length,
      cloudCount: 0,
      mergedCount: localProjects.length,
    };
  }
}

/**
 * Get the last sync timestamp
 */
export function getLastSyncTime(): number | null {
  if (typeof window === 'undefined') return null;
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  return lastSync ? parseInt(lastSync, 10) : null;
}

/**
 * Check if sync is needed (sync if last sync was more than 5 minutes ago)
 */
export function shouldSync(): boolean {
  const lastSync = getLastSyncTime();
  if (!lastSync) return true;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return lastSync < fiveMinutesAgo;
}

