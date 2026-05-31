import { Schema } from 'mongoose';

export function softDeletePlugin(schema: Schema) {
  // Only apply filter if schema has deletedAt field
  if (schema.path('deletedAt')) {
    const filterDeleted = function (this: any) {
      const filter = this.getFilter();
      if (filter && filter.deletedAt === undefined) {
        filter.deletedAt = null;
      }
    };

    schema.pre('find', filterDeleted);
    schema.pre('findOne', filterDeleted);
    schema.pre('countDocuments', filterDeleted);

    schema.pre('aggregate', function (this: any) {
      const pipeline = this.pipeline();
      const hasDeletedAtMatch = pipeline.some((stage: any) => {
        if (stage.$match) {
          return stage.$match.deletedAt !== undefined;
        }
        return false;
      });

      if (!hasDeletedAtMatch) {
        pipeline.unshift({ $match: { deletedAt: null } });
      }
    });
  }
}
