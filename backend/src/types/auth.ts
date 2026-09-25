export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  avatar_url?: string;
  org_id?: string;
  role: 'user' | 'admin' | 'org_admin';
  created_at: Date;
  updated_at: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrganizationMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'member' | 'admin';
  created_at: Date;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}
