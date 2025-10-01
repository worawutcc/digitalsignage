/**
 * Users Feature Module
 * Export all public APIs from the users feature
 */

// Components
export { UserList } from './components/UserList';
export { RoleManager } from './components/RoleManager';
export { PermissionMatrix } from './components/PermissionMatrix';

// Hooks
export {
  useUsers,
  useUser,
  useRoles,
  useRole,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
  useResetUserPassword,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useUserFilters,
  userKeys,
} from './hooks/useUsers';

// Services
export { userService } from './services/userService';

// Types
export type {
  User,
  UserRole,
  Permission,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserListResponse,
  RoleListResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  PermissionResource,
} from './types';

export { PERMISSION_RESOURCES } from './types';
