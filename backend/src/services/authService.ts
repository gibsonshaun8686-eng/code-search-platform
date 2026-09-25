import { Knex } from 'knex';
import { User, Organization, OrganizationMember, AuditLog } from '../types/auth';
import bcrypt from 'bcrypt';

export class AuthService {
  constructor(private db: Knex) {}

  // User operations
  async createUser(data: {
    email: string;
    username: string;
    password: string;
  }): Promise<User> {
    const password_hash = await bcrypt.hash(data.password, 12);
    const id = this.generateId();

    const [user] = await this.db('users')
      .insert({
        id,
        email: data.email,
        username: data.username,
        password_hash,
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.db('users').where({ email }).first();
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.db('users').where({ username }).first();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.db('users').where({ id }).first();
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await this.db('users')
      .where({ id })
      .update({ ...updates, updated_at: new Date() })
      .returning('*');
    return user;
  }

  // Organization operations
  async createOrganization(data: {
    name: string;
    slug: string;
    owner_id: string;
    description?: string;
  }): Promise<Organization> {
    const id = this.generateId();

    const [org] = await this.db('organizations')
      .insert({
        id,
        name: data.name,
        slug: data.slug,
        owner_id: data.owner_id,
        description: data.description,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    // Add owner as admin
    await this.addOrganizationMember(id, data.owner_id, 'admin');

    return org;
  }

  async getOrganization(id: string): Promise<Organization | null> {
    return this.db('organizations').where({ id }).first();
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    return this.db('organizations').where({ slug }).first();
  }

  async listUserOrganizations(userId: string): Promise<Organization[]> {
    return this.db('organizations')
      .join('organization_members', 'organizations.id', 'organization_members.org_id')
      .where('organization_members.user_id', userId)
      .select('organizations.*');
  }

  // Organization member operations
  async addOrganizationMember(
    orgId: string,
    userId: string,
    role: 'member' | 'admin' = 'member'
  ): Promise<OrganizationMember> {
    const id = this.generateId();

    const [member] = await this.db('organization_members')
      .insert({
        id,
        org_id: orgId,
        user_id: userId,
        role,
        created_at: new Date(),
      })
      .returning('*');

    return member;
  }

  async getOrganizationMembers(orgId: string): Promise<(OrganizationMember & { user: User })[]> {
    return this.db('organization_members')
      .join('users', 'organization_members.user_id', 'users.id')
      .where('organization_members.org_id', orgId)
      .select('organization_members.*', this.db.raw('users.* as user'));
  }

  async removeOrganizationMember(orgId: string, userId: string): Promise<void> {
    await this.db('organization_members')
      .where({ org_id: orgId, user_id: userId })
      .delete();
  }

  async updateOrganizationMemberRole(
    orgId: string,
    userId: string,
    role: 'member' | 'admin'
  ): Promise<OrganizationMember> {
    const [member] = await this.db('organization_members')
      .where({ org_id: orgId, user_id: userId })
      .update({ role })
      .returning('*');

    return member;
  }

  // Audit logging
  async logAudit(data: {
    user_id: string;
    action: string;
    resource_type: string;
    resource_id: string;
    changes: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
  }): Promise<AuditLog> {
    const id = this.generateId();

    const [log] = await this.db('audit_logs')
      .insert({
        id,
        ...data,
        created_at: new Date(),
      })
      .returning('*');

    return log;
  }

  async getAuditLogs(
    filters?: { user_id?: string; resource_type?: string; limit?: number }
  ): Promise<AuditLog[]> {
    let query = this.db('audit_logs');

    if (filters?.user_id) {
      query = query.where({ user_id: filters.user_id });
    }
    if (filters?.resource_type) {
      query = query.where({ resource_type: filters.resource_type });
    }

    return query
      .orderBy('created_at', 'desc')
      .limit(filters?.limit || 100);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
