
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Comment {
  id: string;
  text: string;
  link?: string;
  timestamp: string;
  author: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  completedDate?: string;
  order: number;
  createdAt: string;
  comments: Comment[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  course: string;
  status: 'active' | 'converted' | 'lost';
  createdAt: string;
}

export interface Sale {
  id: string;
  agentId?: string;
  type: 'call' | 'website';
  amount: number;
  adCost: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  type: 'adcost' | 'salary' | 'rent' | 'utilities' | 'marketing' | 'other';
  amount: number;
  date: string;
  description: string;
  agentId?: string;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'image' | 'article' | 'course';
  status: 'creation' | 'editing' | 'ready' | 'ads';
  comments: Comment[];
  link?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Student {
  id: string;
  name: string;
  number: string;
  email: string;
  paid: number;
  due: number;
  access: boolean;
  advisor: string;
}

export interface BatchAdCost {
  id: string;
  amount: number;
  date: string;
  description: string;
}

export interface BatchProject {
  id: string;
  courseName: string;
  landingPage: string;
  startDate: string;
  students: Student[];
  adCosts: BatchAdCost[];
  createdAt: string;
}

export interface Version {
  id: string;
  name: string;
  timestamp: string;
  data: {
    tasks: Task[];
    leads: Lead[];
    sales: Sale[];
    expenses: Expense[];
    content: ContentItem[];
    agents: Agent[];
    teamMembers: TeamMember[];
    monthlyTarget: number;
    batchProjects: BatchProject[];
  };
}
