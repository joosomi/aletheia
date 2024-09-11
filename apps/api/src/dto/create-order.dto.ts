import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, Min, Max, MaxLength } from 'class-validator';

import { ProductType } from '../entities/product.entity';

export class CreateOrderDto {
  @ApiProperty({
    description: '주문할 상품 유형',
    enum: ProductType,
    example: ProductType.GOLD_999,
  })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiProperty({
    description: '주문 수량 (그램 단위, 최대 소수점 2자리까지)',
    minimum: 0.01,
    maximum: 9999999.99, //임의로 설정
    example: 10.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999.99)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: '배송 주소',
    maxLength: 255,
    example: '서울시 강남구 테헤란로 123',
  })
  @IsString()
  @MaxLength(255)
  deliveryAddress: string;

  @ApiProperty({
    description: '수령인 이름',
    maxLength: 20,
    example: '홍길동',
  })
  @IsString()
  @MaxLength(100)
  recipientName: string;

  @ApiProperty({
    description: '연락처',
    maxLength: 20,
    example: '010-1234-5678',
  })
  @IsString()
  @MaxLength(20)
  contactNumber: string;

  @ApiProperty({
    description: '우편번호',
    maxLength: 10,
    example: '12345',
  })
  @IsString()
  @MaxLength(10)
  postalCode: string;
}
