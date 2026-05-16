export class ExternalAccountResource {
  static transform(account: any): any {
    const obj = account.toObject ? account.toObject() : { ...account };
    return {
      _id: obj._id,
      external_customer_email: obj.externalCustomerEmail,
      external_customer_name: obj.externalCustomerName,
      company_id: obj.companyId,
      user_id: obj.userId,
      paired_at: obj.pairedAt,
      created_at: obj.createdAt,
    };
  }

  static transformList(accounts: any[]): any[] {
    return accounts.map((a) => ExternalAccountResource.transform(a));
  }
}
