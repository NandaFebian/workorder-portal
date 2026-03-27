/**
 * Client Service Request (sr) Resource
 * Menangani transformasi data sr dengan client, service, forms, dan submissions
 */
export class CSRResource {
  /**
   * Transform sr dengan populate lengkap
   */
  static transformCSR(sr: any): any {
    return sr.toObject ? sr.toObject() : sr;
  }

  /**
   * Transform list of CSRs
   */
  static transformCSRList(csrs: any[]): any[] {
    return csrs.map((sr) => this.transformCSR(sr));
  }
}
