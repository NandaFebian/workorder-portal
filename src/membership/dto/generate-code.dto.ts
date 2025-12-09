import { IsInt, IsOptional, Max, Min, IsString } from 'class-validator';

export class GenerateMemberCodesDto {
    @IsInt()
    @Min(1)
    @Max(100)
    amount: number;

    @IsOptional()
    @IsString()
    prefix?: string;
}
