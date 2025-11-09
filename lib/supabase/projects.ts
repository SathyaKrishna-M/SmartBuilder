import { supabase } from './client';
import { Project } from '@/types';
import type { User } from '@supabase/supabase-js';

export interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  data: Project;
  created_at: string;
  updated_at: string;
}

export async function saveProjectToCloud(userId: string, project: Project): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .upsert({
      id: project.id,
      user_id: userId,
      name: project.title,
      data: project as any,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

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

  // Map database rows to Project objects
  // Use row.id as the source of truth for the project ID
  return (data || []).map((row: ProjectRow) => {
    const project = row.data as Project;
    // Ensure the project ID matches the database row ID
    return {
      ...project,
      id: row.id, // Use the row ID (UUID) as the source of truth
    };
  });
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

  const projectsToSync = projects.map(project => ({
    id: project.id,
    user_id: userId,
    name: project.title,
    data: project,
    updated_at: new Date(project.updatedAt).toISOString(),
  }));

  const { error } = await supabase
    .from('projects')
    .upsert(projectsToSync, {
      onConflict: 'id',
    });

  if (error) {
    console.error('Error syncing projects to cloud:', error);
    throw error;
  }
}

