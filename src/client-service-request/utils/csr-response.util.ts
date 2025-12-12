export class CsrResponseUtil {
    static formatOne(doc: any, clientIntakeForms: any[], submissions: any[]) {
        return {
            _id: doc._id,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            companyId: doc.companyId,
            client: doc.clientId ? {
                name: doc.clientId.name,
                email: doc.clientId.email,
                role: doc.clientId.role,
                positionId: doc.clientId.positionId
            } : null,
            service: doc.serviceId ? {
                _id: doc.serviceId._id,
                companyId: doc.serviceId.companyId,
                title: doc.serviceId.title,
                description: doc.serviceId.description,
                accessType: doc.serviceId.accessType,
                isActive: doc.serviceId.isActive
            } : null,
            clientIntakeForms: clientIntakeForms,
            submissions: submissions
        };
    }
}
