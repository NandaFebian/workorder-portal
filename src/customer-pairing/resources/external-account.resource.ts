import { CompanyResource } from 'src/company/resources/company.resource';

export class ExternalAccountResource {
  static transform(account: any): any {
    const obj = account.toObject ? account.toObject() : { ...account };

    const result: any = {
      _id: obj._id,
      externalCustomerEmail: obj.externalCustomerEmail,
      externalCustomerName: obj.externalCustomerName,
      integrationType: obj.integrationType ?? null,
      pairedAt: obj.pairedAt,
    };

    if (
      obj.companyId &&
      typeof obj.companyId === 'object' &&
      obj.companyId._id
    ) {
      result.company = CompanyResource.transformCompanyMinimal(obj.companyId);
    } else {
      result.company = obj.companyId;
    }

    return result;
  }

  static transformList(accounts: any[]): any[] {
    return accounts.map((a) => ExternalAccountResource.transform(a));
  }
}
