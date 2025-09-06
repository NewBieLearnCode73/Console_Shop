export enum OrderStatus {
  // ===== Trạng thái khởi tạo =====
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION', // COD: Đơn mới, chờ shop xác nhận
  PENDING_PAYMENT = 'PENDING_PAYMENT', // Online: Đơn mới, chờ thanh toán

  // ===== Thanh toán =====
  PAID = 'PAID', // Online: Thanh toán thành công (chờ xác nhận)

  // ===== Xử lý đơn hàng =====
  CONFIRMED = 'CONFIRMED', // Shop đã xác nhận đơn
  SHIPPED = 'SHIPPED', // Đơn đang giao (Physical only)
  DELIVERED = 'DELIVERED', // Đơn đã giao (Physical only)

  // ===== Kết thúc =====
  COMPLETED = 'COMPLETED', // Đơn hoàn tất:
  // - COD: giao xong + thu tiền
  // - Online Physical: giao xong
  // - Online Digital: thanh toán xong

  // ===== Trường hợp đặc biệt =====
  CANCELED = 'CANCELED', // Đơn bị hủy (khách hoặc shop)
  FAILED = 'FAILED', // Thanh toán thất bại (Online)
  RETURNED = 'RETURNED', // Giao thất bại / khách trả hàng
}

/**
* 
COD flow:
PENDING_CONFIRMATION → CONFIRMED → SHIPPED → DELIVERED → COMPLETED

Online flow:
- PHYSICAL:
    - PENDING_PAYMENT → PAID → CONFIRMED → SHIPPED → DELIVERED → COMPLETED

- DIGITAL (Mã game):
    - PENDING_PAYMENT → COMPLETED

Trường hợp lỗi:
Nếu Online payment fail → FAILED
Nếu khách/trung tâm vận chuyển trả hàng → RETURNED
Nếu khách/Shop hủy trước khi giao → CANCELED
*
**/
