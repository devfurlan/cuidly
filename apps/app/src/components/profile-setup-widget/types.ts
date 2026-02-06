export type ProfileTaskStatus = 'completed' | 'pending' | 'locked';

export interface ProfileTask {
  id: string;
  label: string;
  description?: string;
  status: ProfileTaskStatus;
  href?: string;
  requiresPro?: boolean;
}

export interface ProfileSetupData {
  userType: 'nanny' | 'family';
  completedTasks: number;
  totalTasks: number;
  percentComplete: number;
  tasks: ProfileTask[];
  hasProSubscription: boolean;
}

export interface ProfileSetupAPIResponse {
  success: boolean;
  data: ProfileSetupData;
}

export interface WidgetState {
  minimized: boolean;
  dismissedUntil?: string; // ISO date string
}
