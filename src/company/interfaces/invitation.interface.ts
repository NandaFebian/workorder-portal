export interface SuccessfulInvite {
    user: {
        name: string;
        email: string;
    };
    role_offered: string;
    position_offered: {
        _id: string;
        name: string;
    } | null;
}

export interface InviteError {
    user: {
        email: string;
        name?: string;
    };
    role_offered?: string;
    position_offered?: {
        _id: string;
        name: string;
    } | null;
    message: string;
}

export interface InviteEmployeesResponse {
    message: string;
    meta: {
        successCount: number;
        errorCount: number;
    };
    data: {
        company: {
            _id: string;
            name: string;
        };
        invited: SuccessfulInvite[];
    };
    errors?: InviteError[];
}
