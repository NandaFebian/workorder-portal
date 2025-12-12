/**
 * Position Resource
 * Menangani transformasi data Position
 */
export class PositionResource {
    /**
     * Transform position
     */
    static transformPosition(position: any): any {
        return position.toObject ? position.toObject() : position;
    }

    /**
     * Transform list of positions
     */
    static transformPositionList(positions: any[]): any[] {
        return positions.map((pos) => this.transformPosition(pos));
    }
}
