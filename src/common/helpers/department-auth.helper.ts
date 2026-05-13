import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from '../enums/role.enum';

export class DepartmentAuthHelper {
  /**
   * Returns true if the manager has NO position assigned.
   * A General Manager has full access (legacy behavior).
   */
  static isGeneralManager(user: AuthenticatedUser): boolean {
    return user.role === Role.CompanyManager && !user.position?._id;
  }

  /**
   * Returns true if the manager has a position assigned.
   * A Department Manager has scoped access to their department only.
   */
  static isDepartmentManager(user: AuthenticatedUser): boolean {
    return user.role === Role.CompanyManager && !!user.position?._id;
  }

  /**
   * Check whether a user can manage (update/delete/view) a service.
   *
   * Rules:
   * - Owner → always allowed
   * - General Manager (no position) → always allowed
   * - Department Manager → only if ALL positionIds in workOrdersConfig match their position
   * - Others → not allowed (caller handles this separately via role guard)
   */
  static canManageService(
    user: AuthenticatedUser,
    workOrdersConfig: any[],
  ): boolean {
    if (user.role === Role.CompanyOwner) return true;
    if (this.isGeneralManager(user)) return true;
    if (!this.isDepartmentManager(user)) return false;

    if (!workOrdersConfig || workOrdersConfig.length === 0) return false;

    const managerPositionId = user.position!._id.toString();
    return workOrdersConfig.every((config) => {
      // After aggregation, positionId is hydrated into positionsOnDuty._id
      // Support both raw (positionId) and hydrated (positionsOnDuty) shapes
      const posId =
        config.positionsOnDuty?._id?.toString() ??  // hydrated (from aggregation)
        config.positionId?._id?.toString() ??        // raw ObjectId-ref populated
        config.positionId?.toString() ??             // raw ObjectId string
        null;
      return posId === managerPositionId;
    });
  }

  /**
   * Check whether a department manager can CREATE a service with the given configs.
   * Same rule: all positionIds in workOrdersConfig must match the manager's position.
   */
  static canCreateServiceWithConfigs(
    user: AuthenticatedUser,
    configs: any[],
  ): boolean {
    return this.canManageService(user, configs);
  }

  /**
   * Filter a list of services to only those the department manager can access.
   * For General Managers and Owners, returns the full list unmodified.
   */
  static filterServicesForUser(
    user: AuthenticatedUser,
    services: any[],
  ): any[] {
    if (user.role === Role.CompanyOwner) return services;
    if (this.isGeneralManager(user)) return services;
    if (!this.isDepartmentManager(user)) return services;

    return services.filter((svc) =>
      this.canManageService(user, svc.workOrdersConfig ?? []),
    );
  }
}
