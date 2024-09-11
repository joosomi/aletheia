import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { Status } from '../entities/invoice.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: Status, description: '변경할 주문 상태' })
  @IsEnum(Status)
  @IsNotEmpty()
  status: Status;
}
