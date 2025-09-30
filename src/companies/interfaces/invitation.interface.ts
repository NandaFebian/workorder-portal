export interface SuccessfulInvite {
    user: {
        name: string;
        email: string;
    };
    role_offered: string;
    position_offered: {
        _id: string;
        name: string;
    };
}

export interface InviteError {
    invite: {
        email: string;
        role: string;
        positionId: string;
    };
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
