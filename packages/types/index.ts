// Shared types for Phenol

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: 'admin' | 'clinician';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  name: string;
  description?: string;
  concentration: string;
  unit: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InfusionChecklist {
  id: string;
  patientId: string;
  medicationId: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  clinicianId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistStep {
  id: string;
  checklistId: string;
  title: string;
  description?: string;
  order: number;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
