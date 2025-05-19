import { IsNumber, IsPositive, Min } from 'class-validator';

export class AddCartItemDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
} 