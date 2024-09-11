import { Entity, Column, ManyToOne } from 'typeorm';

import { Product } from './product.entity';

import { BaseEntity } from '@app/shared/database/base.entity';

export enum OrderType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
}

//주문 상태
export enum Status {
  ORDER_COMPLETED = 'ORDER_COMPLETED', //주문 완료
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED', //입금 완료
  SHIPPED = 'SHIPPED', //발송 완료
  PAYMENT_SENT = 'PAYMENT_SENT', //송금 완료
  ITEM_RECEIVED = 'ITEM_RECEIVED', //수령 완료
}

@Entity()
export class Invoice extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  orderNumber: string; //주문 번호 - human readable

  @Column({
    type: 'enum',
    enum: OrderType,
  })
  orderType: OrderType;

  @Column({
    type: 'enum',
    enum: Status,
  })
  status: Status;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalPrice: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  deliveryAddress: string; //배송 주소

  @Column({
    type: 'varchar',
    length: 20,
  })
  recipientName: string; //수령인

  @Column({
    type: 'varchar',
    length: 20,
  })
  contactNumber: string; //연락처

  @Column({
    type: 'varchar',
    length: 10,
  })
  postalCode: string; //우편번호

  @ManyToOne(() => Product, (product) => product.invoices, { nullable: false })
  product: Product; // Product와의 관계 설정

  @Column({
    type: 'varchar',
    length: 36,
  })
  userId: string; // JWT 토큰으로 전달받은 사용자 ID(uuid)
}
