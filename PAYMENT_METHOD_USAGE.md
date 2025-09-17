# Payment Method Integration - Usage Guide

## Tổng quan thay đổi

Đã thêm thành công `payment_method` column vào Order entity để có thể lấy phương thức thanh toán trực tiếp từ Order mà không cần join với Payment table.

## Các thay đổi chính:

### 1. Order Entity

```typescript
@Entity()
export class Order extends AbstractEntity<Order> {
  // ... existing fields

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @OneToOne(() => Payment, (payment) => payment.order, { nullable: true })
  payment: Payment | null;
}
```

### 2. Payment Entity

```typescript
@Entity()
export class Payment extends AbstractEntity<Payment> {
  // ... existing fields

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
```

### 3. Database Migration

- Đã tạo và chạy migration `AddPaymentMethodToOrder1758121840139`
- Thêm `payment_method` column vào `order` table
- Tạo proper foreign key relationship giữa `payment` và `order`
- Update existing orders với default `COD` payment method

### 4. Order Service Updates

Các method tạo order đã được update để set `payment_method`:

#### Digital Product Buy Now (MoMo only)

```typescript
const order = manager.getRepository(Order).create({
  // ... other fields
  payment_method: PaymentMethod.MOMO_WALLET,
  // ... other fields
});
```

#### Physical Product Buy Now

```typescript
// COD
const order = manager.getRepository(Order).create({
  // ... other fields
  payment_method: PaymentMethod.COD,
  // ... other fields
});

// MoMo
const order = manager.getRepository(Order).create({
  // ... other fields
  payment_method: PaymentMethod.MOMO_WALLET,
  // ... other fields
});
```

#### Cart Checkout (Digital)

```typescript
const order = manager.getRepository(Order).create({
  // ... other fields
  payment_method: PaymentMethod.MOMO_WALLET,
  // ... other fields
});
```

#### Cart Checkout (Physical)

```typescript
const order = manager.getRepository(Order).create({
  // ... other fields
  payment_method: paymentMethod, // COD hoặc MOMO_WALLET
  // ... other fields
});
```

## Cách sử dụng

### 1. Lấy payment method từ Order

```typescript
// Direct access - không cần join
const order = await this.orderRepository.findOne({
  where: { id: orderId },
});
console.log('Payment method:', order.payment_method); // 'COD' hoặc 'MOMO_WALLET'
```

### 2. Lấy order với payment details

```typescript
const order = await this.orderRepository.findOne({
  where: { id: orderId },
  relations: ['payment'], // optional - chỉ khi cần payment details
});

console.log('Payment method:', order.payment_method);
console.log('Payment status:', order.payment?.status);
console.log('Transaction ID:', order.payment?.trans_id);
```

### 3. Query orders by payment method

```typescript
const codOrders = await this.orderRepository.find({
  where: { payment_method: PaymentMethod.COD },
});

const momoOrders = await this.orderRepository.find({
  where: { payment_method: PaymentMethod.MOMO_WALLET },
});
```

## Flow hoạt động

### COD Orders:

1. Tạo order với `payment_method: PaymentMethod.COD`
2. Order có status `PENDING_CONFIRMATION`
3. Khi ship order → tạo Payment record với status `PENDING` qua Kafka
4. Khi giao hàng thành công → update Payment status thành `PAID`

### MoMo Orders:

1. Tạo order với `payment_method: PaymentMethod.MOMO_WALLET`
2. Order có status `PENDING_PAYMENT`
3. Send Kafka event để tạo MoMo payment link
4. Khi thanh toán thành công → tạo Payment record với status `PAID` qua Kafka

## Ưu điểm

1. **Performance**: Không cần join với Payment table để biết payment method
2. **Data Consistency**: Payment method được lưu ngay khi tạo order
3. **Query Efficiency**: Có thể filter/group orders theo payment method dễ dàng
4. **Kafka Integration**: Hoạt động tốt với kiến trúc async hiện tại

## Test Cases

1. ✅ Tạo digital product order (MoMo) - có `payment_method: 'MOMO_WALLET'`
2. ✅ Tạo physical product order COD - có `payment_method: 'COD'`
3. ✅ Tạo physical product order MoMo - có `payment_method: 'MOMO_WALLET'`
4. ✅ Cart checkout digital (MoMo) - có `payment_method: 'MOMO_WALLET'`
5. ✅ Cart checkout physical (COD/MoMo) - có `payment_method` tương ứng
6. ✅ Migration chạy thành công và existing data được preserve

## Production Notes

- Migration đã xử lý existing data safety
- Orphaned payment records đã được cleanup
- Existing orders được set default payment method là `COD`
- Foreign key constraints đã được thiết lập properly
