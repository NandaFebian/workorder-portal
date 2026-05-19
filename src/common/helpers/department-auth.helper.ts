import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from '../enums/role.enum';

/**
 * Lightweight shape for raw User documents from the database.
 * Unlike AuthenticatedUser (which has `position: { _id }`),
 * DB docs have `positionId` (ObjectId or populated).
 */
export interface UserDocumentLike {
  role: string;
  positionId?: any;
}

export class DepartmentAuthHelper {
  /**
   * Extract position ID string from either AuthenticatedUser or raw DB user document.
   */
  private static _extractPositionId(user: AuthenticatedUser | UserDocumentLike): string | null {
    if ('position' in user && (user as AuthenticatedUser).position?._id) {
      return (user as AuthenticatedUser).position!._id.toString();
    }
    if ('positionId' in user && (user as UserDocumentLike).positionId) {
      const pid = (user as UserDocumentLike).positionId;
      return pid?._id?.toString() ?? pid?.toString() ?? null;
    }
    return null;
  }

  private static _hasPosition(user: AuthenticatedUser | UserDocumentLike): boolean {
    return !!this._extractPositionId(user);
  }

  static isGeneralManager(user: AuthenticatedUser | UserDocumentLike): boolean {
    return user.role === Role.CompanyManager && !this._hasPosition(user);
  }

  static isDepartmentManager(user: AuthenticatedUser | UserDocumentLike): boolean {
    return user.role === Role.CompanyManager && this._hasPosition(user);
  }

  /**
   * Check whether a user can manage a service.
   *
   * Accepts both AuthenticatedUser (from request) and raw DB user documents.
   *
   * Rules:
   * - Owner → always allowed
   * - General Manager (no position) → always allowed
   * - Department Manager → only if ALL positionIds in workOrdersConfig match their position
   * - Others → not allowed
   */
  static canManageService(
    user: AuthenticatedUser | UserDocumentLike,
    workOrdersConfig: any[],
  ): boolean {
    if (user.role === Role.CompanyOwner) return true;
    if (this.isGeneralManager(user)) return true;
    if (!this.isDepartmentManager(user)) return false;

    if (!workOrdersConfig || workOrdersConfig.length === 0) return false;

    const managerPositionId = this._extractPositionId(user)!;
    return workOrdersConfig.every((config) => {
      const posId =
        config.positionsOnDuty?._id?.toString() ??
        config.positionId?._id?.toString() ??
        config.positionId?.toString() ??
        null;
      return posId === managerPositionId;
    });
  }

  static canCreateServiceWithConfigs(
    user: AuthenticatedUser | UserDocumentLike,
    configs: any[],
  ): boolean {
    return this.canManageService(user, configs);
  }

  static filterServicesForUser(
    user: AuthenticatedUser | UserDocumentLike,
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

