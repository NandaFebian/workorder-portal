/**
 * Position Resource
 * Handles position data transformation for API responses
 */
export class PositionResource {
    /**
     * Transform position - full details
     */
    static transformPosition(position: any): any {
        if (!position) return null;
        return position.toObject ? position.toObject() : { ...position };
    }

    /**
     * Transform position minimal - for nested objects
     * Returns only essential fields: _id, name, description
     */
    static transformPositionMinimal(position: any): any {
        if (!position) return null;

        const posObj = position.toObject ? position.toObject() : { ...position };

        return {
            _id: posObj._id,
            name: posObj.name,
            description: posObj.description,
        };
    }

    /**
     * Transform list of positions
     */
    static transformPositionList(positions: any[]): any[] {
        if (!positions || !Array.isArray(positions)) {
            return [];
        }
        return positions.map((pos) => this.transformPosition(pos));
    }
}
