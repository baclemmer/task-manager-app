export type TaskStatus = "todo" | "in_progress" | "waiting" | "done";
export type TaskPriority = "low" | "medium" | "high";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "waiting", "done"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  waiting: "Waiting",
  done: "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  due_date: string | null;
  start_date: string | null;
  completed_date: string | null;
  assignee_id: string | null;
  project_id: string | null;
  category_id: string | null;
  needs_help: boolean;
  is_urgent: boolean;
  behind_schedule_override: boolean | null;
  created_at: string;
  updated_at: string;
};

export type TaskWithFlags = Task & {
  is_behind_schedule: boolean;
};

// Joined shape used by the dashboards
export type TaskWithRelations = TaskWithFlags & {
  project: Project | null;
  category: Category | null;
  assignee: Profile | null;
  tags: Tag[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: Partial<Project> & { name: string };
        Update: Partial<Project>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: Partial<Category> & { name: string };
        Update: Partial<Category>;
        Relationships: [];
      };
      tags: {
        Row: Tag;
        Insert: Partial<Tag> & { name: string };
        Update: Partial<Tag>;
        Relationships: [];
      };
      task_tags: {
        Row: { task_id: string; tag_id: string };
        Insert: { task_id: string; tag_id: string };
        Update: { task_id?: string; tag_id?: string };
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: Partial<Task> & { title: string };
        Update: Partial<Task>;
        Relationships: [];
      };
    };
    Views: {
      tasks_with_flags: {
        Row: TaskWithFlags;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
