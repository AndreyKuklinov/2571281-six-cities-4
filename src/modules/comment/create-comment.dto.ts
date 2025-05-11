import { IsString, Length, IsInt, Min, Max } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @Length(5, 1024)
  public text!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  public rating!: number;
}
