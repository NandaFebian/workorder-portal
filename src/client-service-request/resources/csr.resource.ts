/**
 * Client Service Request (CSR) Resource
 * Menangani transformasi data CSR dengan client, service, forms, dan submissions
 */
export class CSRResource {
    /**
     * Transform CSR dengan populate lengkap
     */
    static transformCSR(csr: any): any {
        return csr.toObject ? csr.toObject() : csr;
    }

    /**
     * Transform list of CSRs
     */
    static transformCSRList(csrs: any[]): any[] {
        return csrs.map((csr) => this.transformCSR(csr));
    }
}
