import { PositionResource } from '../../positions/resources/position.resource';

/**
 * User Resource
 * Handles user data transformation for API responses
 * Ensures consistent user data format across all endpoints
 */
export class UserResource {
    /**
     * Transform user - remove sensitive data like password
     */
    static transformUser(user: any): any {
        if (!user) return null;

        const userObj = user.toObject ? user.toObject() : { ...user };

        // Always remove password from response
        delete userObj.password;

        // Transform positionId to position object if exists
        if (userObj.positionId) {
            userObj.position = PositionResource.transformPosition(userObj.positionId);
            delete userObj.positionId;
        }

        return userObj;
    }

    /**
     * Transform user with position details
     * Use when position data is already populated
     */
    static transformUserWithPosition(user: any): any {
        if (!user) return null;

        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;

        // If positionId is populated, transform it to position
        if (userObj.positionId) {
            userObj.position = PositionResource.transformPosition(userObj.positionId);
            delete userObj.positionId;
        }

        return userObj;
    }

    /**
     * Transform user minimal - for nested objects
     * Returns only essential fields: _id, name, email, role, position (if exists)
     */
    static transformUserMinimal(user: any): any {
        if (!user) return null;

        const userObj = user.toObject ? user.toObject() : { ...user };

        const minimal: any = {
            _id: userObj._id,
            name: userObj.name,
            email: userObj.email,
            role: userObj.role,
        };

        // Include position if exists
        if (userObj.positionId) {
            minimal.position = PositionResource.transformPositionMinimal(userObj.positionId);
        } else if (userObj.position) {
            minimal.position = PositionResource.transformPositionMinimal(userObj.position);
        }

        return minimal;
    }

    /**
     * Transform array of users
     */
    static transformUserList(users: any[]): any[] {
        if (!users || !Array.isArray(users)) {
            return [];
        }
        return users.map((user) => this.transformUser(user));
    }

    /**
     * Transform user for authentication response
     * Includes all fields except password
     */
    static transformAuthUser(user: any): any {
        return this.transformUser(user);
    }
}
