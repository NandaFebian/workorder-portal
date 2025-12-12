/**
 * Auth Resource
 * Menangani transformasi data User dan Auth untuk response
 */
export class AuthResource {
    /**
     * Transform user - remove sensitive data
     */
    static transformUser(user: any): any {
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    }

    /**
     * Transform login response dengan token
     */
    static transformLoginResponse(user: any, token: string): any {
        return {
            user: this.transformUser(user),
            token,
        };
    }

    /**
     * Transform register company response
     */
    static transformRegisterCompanyResponse(company: any, owner: any): any {
        return {
            company: company.toObject ? company.toObject() : company,
            owner: this.transformUser(owner),
        };
    }
}
