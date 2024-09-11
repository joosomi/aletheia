import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

enum InvoiceType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
}

export class GetOrdersDto {
  @ApiProperty({
    description: '조회할 날짜 (YYYY-MM-DD 형식)',
    example: '2023-09-11',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: '한 페이지당 조회할 주문 수',
    minimum: 1,
    default: 10,
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: '건너뛸 주문 수 (페이지네이션에 사용)',
    minimum: 0,
    default: 0,
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiProperty({
    description: '주문 유형',
    enum: InvoiceType,
    example: InvoiceType.PURCHASE,
    required: false,
  })
  @IsOptional()
  @IsEnum(InvoiceType)
  invoiceType?: InvoiceType;
}
