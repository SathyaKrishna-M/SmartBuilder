import { supabase } from './client';
import { Project } from '@/types';
import type { User } from '@supabase/supabase-js';
import type { Database } from './database.types';

export interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  data: Project;
  created_at: string;
  updated_at: string;
}

// Type guard to check if data is a valid Project
function isValidProject(data: unknown): data is Project {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'title' in data &&
    'questions' in data &&
    Array.isArray((data as Project).questions)
  );
}

export async function saveProjectToCloud(userId: string, project: Project): Promise<void> {
  // Convert Project to Json type for Supabase
  const projectData = {
    id: project.id,
    user_id: userId,
    name: project.title,
    data: project as unknown as Database['public']['Tables']['projects']['Row']['data'],
    updated_at: new Date().toISOString(),
  };

  // Use type assertion to bypass strict typing for upsert
  const { error } = await (supabase
    .from('projects')
    .upsert(projectData as any, {
      onConflict: 'id',
    }) as any);

  if (error) {
    console.error('Error saving project to cloud:', error);
    throw error;
  }
}

export async function loadProjectsFromCloud(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error loading projects from cloud:', error);
    return [];
  }

  if (!data || !Array.isArray(data)) {
    return [];
  }

  // Map database rows to Project objects
  // Use row.id as the source of truth for the project ID
  return data
    .map((row: unknown): Project | null => {
      // Type guard to ensure row is ProjectRow
      if (
        typeof row === 'object' &&
        row !== null &&
        'id' in row &&
        'data' in row &&
        'name' in row
      ) {
        const projectRow = row as ProjectRow;
        const projectData = projectRow.data;
        
        // Validate that data is a valid Project
        if (isValidProject(projectData)) {
          return {
            ...projectData,
            id: projectRow.id, // Use the row ID (UUID) as the source of truth
          };
        }
      }
      console.warn('Invalid project data in database row:', row);
      return null;
    })
    .filter((project): project is Project => project !== null);
}

export async function deleteProjectFromCloud(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error deleting project from cloud:', error);
    throw error;
  }
}

export async function syncProjectsToCloud(userId: string, projects: Project[]): Promise<void> {
  if (projects.length === 0) return;

  // Convert Projects to Json type for Supabase
  const projectsToSync = projects.map(project => ({
    id: project.id,
    user_id: userId,
    name: project.title,
    data: project as unknown as Database['public']['Tables']['projects']['Row']['data'],
    updated_at: new Date(project.updatedAt).toISOString(),
  }));

  // Use type assertion to bypass strict typing for upsert
  const { error } = await (supabase
    .from('projects')
    .upsert(projectsToSync as any, {
      onConflict: 'id',
    }) as any);

  if (error) {
    console.error('Error syncing projects to cloud:', error);
    throw error;
  }
}

