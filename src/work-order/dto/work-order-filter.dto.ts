export class WorkOrderFilterDto {
    status?: string;
    priority?: string;
    startDate?: Date;
    endDate?: Date;
    assignedStaffId?: string;
    clientId?: string;
}
