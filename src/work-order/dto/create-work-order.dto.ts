export class CreateWorkOrderDto {
  serviceRequestId: string;
  serviceId: string;
  description?: string;
  priority?: string; // low, medium, high
}
