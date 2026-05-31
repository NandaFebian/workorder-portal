import { MembershipResource } from './membership.resource';

describe('MembershipResource', () => {
  describe('transformMembershipCode', () => {
    it('should transform camelCase properties to snake_case', () => {
      const mockCode = {
        _id: 'any-id',
        companyId: 'company-id',
        externalCustomerEmail: 'test@example.com',
        externalCustomerName: 'Test Name',
        token: 'TOKEN123',
        claimedAt: new Date('2026-01-01T00:00:00.000Z'),
        deletedAt: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        claimedBy: {
          _id: 'user-id',
          name: 'User Name',
          email: 'user@example.com',
          role: 'client',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      };

      const result = MembershipResource.transformMembershipCode(mockCode);

      expect(result).toEqual({
        _id: 'any-id',
        companyId: 'company-id',
        externalCustomerEmail: 'test@example.com',
        externalCustomerName: 'Test Name',
        token: 'TOKEN123',
        claimedAt: new Date('2026-01-01T00:00:00.000Z'),
        integrationType: 'claim_token',
        deletedAt: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        claimedBy: {
          _id: 'user-id',
          name: 'User Name',
          email: 'user@example.com',
          role: 'client',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      });
    });

    it('should handle null or unpopulated claimedBy', () => {
      const mockCode = {
        _id: 'any-id',
        companyId: 'company-id',
        externalCustomerEmail: 'test@example.com',
        externalCustomerName: 'Test Name',
        token: 'TOKEN123',
        claimedAt: null,
        deletedAt: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        claimedBy: null,
      };

      const result = MembershipResource.transformMembershipCode(mockCode);

      expect(result.claimedBy).toBeNull();
    });
  });

  describe('transformMembershipCodeList', () => {
    it('should transform a list of membership codes', () => {
      const mockCodes = [
        {
          _id: '1',
          companyId: 'company-id',
          externalCustomerEmail: 'test1@example.com',
          externalCustomerName: 'Name 1',
          token: 'T1',
          claimedAt: null,
          deletedAt: null,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ];

      const result = MembershipResource.transformMembershipCodeList(mockCodes);
      expect(result).toHaveLength(1);
      expect(result[0].companyId).toBe('company-id');
      expect(result[0].externalCustomerEmail).toBe('test1@example.com');
    });

    it('should handle empty or invalid lists', () => {
      expect(MembershipResource.transformMembershipCodeList([])).toEqual([]);
      expect(
        MembershipResource.transformMembershipCodeList(null as any),
      ).toEqual([]);
    });
  });
});
