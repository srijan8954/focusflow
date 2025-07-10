export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  completed: boolean;
  timeSpent: number; // in minutes
  createdAt: Date;
}

export interface WorkSession {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in minutes
  tasks: Task[];
  isActive: boolean;
  createdAt: Date;
}

export enum TaskCategory {
  DEVELOPMENT = 'Development',
  DESIGN = 'Design',
  MEETINGS = 'Meetings',
  PLANNING = 'Planning',
  RESEARCH = 'Research',
  ADMIN = 'Admin',
  REVIEW = 'Review',
  OTHER = 'Other'
}

export interface SessionStats {
  totalSessions: number;
  totalHours: number;
  averageSessionLength: number;
  tasksByCategory: Record<TaskCategory, number>;
  mostTimeSpentTask: string;
  productivityScore: number;
}