export class UpdateWorkOrderStatusDto {
    status: string; // drafted, in_progress, on_hold, completed, cancelled
    reason?: string;
}
