/**
 * Users Feature Module
 * Export all public APIs from the users feature
 */

// Components - export as dynamic imports to avoid JSX compilation issues
export const UserComponents = {
  UserList: () => import('./components/UserList').then(m => ({ default: m.UserList })),
  RoleManager: () => import('./components/RoleManager').then(m => ({ default: m.RoleManager })),
  PermissionMatrix: () => import('./components/PermissionMatrix').then(m => ({ default: m.PermissionMatrix }))
}

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
