export class CreateWorkOrderDto {
    clientServiceRequestId: string;
    serviceId: string;
    description?: string;
    priority?: string; // low, medium, high
}
