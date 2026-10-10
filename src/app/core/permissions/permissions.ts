import { UserRole } from '../models/user.model';

export type Action =
  | 'application:create'
  | 'application:edit'
  | 'application:view:own'
  | 'application:view:all'
  | 'application:view:assigned'
  | 'application:review'
  | 'application:assign'
  | 'sensitive:reveal'
  | 'admin:access';

export const ROLE_PERMISSIONS: Record<UserRole, Action[]> = {
  SALES: [
    'application:create',
    'application:edit',
    'application:view:own',
  ],
  REVIEWER: [
    'application:view:assigned',
    'application:review',
    'sensitive:reveal',
  ],
  ADMIN: [
    'application:create',
    'application:edit',
    'application:view:own',
    'application:view:all',
    'application:view:assigned',
    'application:review',
    'application:assign',
    'sensitive:reveal',
    'admin:access',
  ],
};
