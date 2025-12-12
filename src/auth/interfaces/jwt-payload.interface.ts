export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    companyId?: string;
    positionId?: string;
}
