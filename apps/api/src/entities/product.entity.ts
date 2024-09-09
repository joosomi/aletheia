import { Entity, Column, OneToMany } from 'typeorm';

import { Invoice } from './invoice.entity';

import { BaseEntity } from '@app/shared/database/base.entity';

enum ProductType {
  GOLD_999 = 'GOLD_999', // 99.9% 금
  GOLD_9999 = 'GOLD_9999', //99.99% 금
}

@Entity()
export class Product extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ProductType,
  })
  type: ProductType;

  @Column({
    type: 'decimal',
    precision: 10, //총 자릿수 (소수점 앞, 뒤 포함해서)
    scale: 2, //소수점 아래 두 자릿수까지 값을 저장
  })
  purchasePricePerGram: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  salePricePerGram: number;

  @OneToMany(() => Invoice, (invoice) => invoice.product)
  invoices: Invoice[];
}
