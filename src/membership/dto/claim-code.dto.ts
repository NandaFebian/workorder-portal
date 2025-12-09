import { IsNotEmpty, IsString } from 'class-validator';

export class ClaimMemberCodeDto {
    @IsNotEmpty()
    @IsString()
    code: string;
}
