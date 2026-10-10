import { User } from '../app/core/models/user.model';

export interface MockCredential {
  email: string;
  password: string;
  user: User;
}

export const MOCK_CREDENTIALS: MockCredential[] = [
  {
    email: 'sales@techcraft.dev',
    password: 'password',
    user: {
      id: 'usr-001',
      name: 'Alex Turner',
      email: 'sales@techcraft.dev',
      role: 'SALES',
    },
  },
  {
    email: 'reviewer@techcraft.dev',
    password: 'password',
    user: {
      id: 'usr-002',
      name: 'Jordan Lee',
      email: 'reviewer@techcraft.dev',
      role: 'REVIEWER',
    },
  },
  {
    email: 'admin@techcraft.dev',
    password: 'password',
    user: {
      id: 'usr-003',
      name: 'Morgan Blake',
      email: 'admin@techcraft.dev',
      role: 'ADMIN',
    },
  },
];
