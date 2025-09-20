# Report API Documentation - UC03-050: Xem doanh số

## Overview

Module này cung cấp các API để Manager xem báo cáo doanh số với nhiều chế độ khác nhau và bộ lọc nâng cao.

## Authentication

Tất cả endpoints đều yêu cầu:

- Đăng nhập với vai trò Manager
- JWT Cookie Authentication
- Role Guard (MANAGER)

_Note: Guards hiện tại đã được comment để test, cần uncomment khi deploy production._

## Endpoints

### 1. Lấy báo cáo doanh số tổng quan

```http
GET /api/reports/sales/overview?month=9&year=2025
```

**Query Parameters:**

- `month` (optional): Tháng (1-12), mặc định tháng hiện tại
- `year` (optional): Năm (>= 2000), mặc định năm hiện tại

**Response:**

```json
{
  "success": true,
  "message": "Lấy báo cáo doanh số tổng quan thành công",
  "data": {
    "totalOrders": 150,
    "totalRevenue": 25500000,
    "totalProductsSold": 300,
    "period": "9/2025"
  },
  "timestamp": "2025-09-20T10:30:00.000Z"
}
```

### 2. Lấy doanh số theo từng ngày

```http
GET /api/reports/sales/daily?startDate=2025-09-01&endDate=2025-09-30
```

**Query Parameters:**

- `startDate` (required): Ngày bắt đầu (ISO date string)
- `endDate` (required): Ngày kết thúc (ISO date string)

**Response:**

```json
{
  "success": true,
  "message": "Lấy báo cáo doanh số theo ngày thành công",
  "data": [
    {
      "date": "2025-09-01",
      "totalOrders": 10,
      "totalRevenue": 1500000,
      "totalProductsSold": 25
    }
  ],
  "timestamp": "2025-09-20T10:30:00.000Z"
}
```

### 3. Lấy doanh số theo từng tháng

```http
GET /api/reports/sales/monthly?year=2025
```

**Query Parameters:**

- `year` (optional): Năm (>= 2000), mặc định năm hiện tại

**Response:**

```json
{
  "success": true,
  "message": "Lấy báo cáo doanh số theo tháng thành công",
  "data": [
    {
      "month": "1/2025",
      "year": 2025,
      "totalOrders": 100,
      "totalRevenue": 15000000,
      "totalProductsSold": 200
    }
  ],
  "timestamp": "2025-09-20T10:30:00.000Z"
}
```

### 4. Lấy doanh số theo từng năm

```http
GET /api/reports/sales/yearly
```

**Response:**

```json
{
  "success": true,
  "message": "Lấy báo cáo doanh số theo năm thành công",
  "data": [
    {
      "year": 2025,
      "totalOrders": 1200,
      "totalRevenue": 180000000,
      "totalProductsSold": 2400
    }
  ],
  "timestamp": "2025-09-20T10:30:00.000Z"
}
```

### 5. Lấy danh sách sản phẩm bán chạy

```http
GET /api/reports/sales/top-products?limit=10&startDate=2025-09-01&endDate=2025-09-30
```

**Query Parameters:**

- `limit` (optional): Số lượng sản phẩm trả về (1-100), mặc định 10
- `startDate` (optional): Ngày bắt đầu để lọc
- `endDate` (optional): Ngày kết thúc để lọc

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm bán chạy thành công",
  "data": [
    {
      "productId": "uuid",
      "productName": "iPhone 15 Pro",
      "variantId": "uuid",
      "variantName": "iPhone 15 Pro - 256GB - Natural Titanium",
      "sku": "IP15PRO256NT",
      "totalQuantitySold": 50,
      "totalRevenue": 150000000,
      "categoryName": "Smartphones",
      "brandName": "Apple"
    }
  ],
  "timestamp": "2025-09-20T10:30:00.000Z"
}
```

### 6. Lấy doanh số với bộ lọc nâng cao

```http
GET /api/reports/sales/filtered?startDate=2025-09-01&endDate=2025-09-30&orderType=PHYSICAL&categoryId=uuid&brandId=uuid
```

**Query Parameters:**

- `startDate` (optional): Ngày bắt đầu
- `endDate` (optional): Ngày kết thúc
- `orderType` (optional): Loại đơn hàng (PHYSICAL hoặc DIGITAL)
- `categoryId` (optional): ID danh mục sản phẩm
- `brandId` (optional): ID thương hiệu
- `productId` (optional): ID sản phẩm cụ thể

**Response:**

```json
{
  "success": true,
  "message": "Lấy báo cáo doanh số với bộ lọc thành công",
  "data": {
    "totalOrders": 75,
    "totalRevenue": 12000000,
    "totalProductsSold": 150,
    "period": "01/09/2025 - 30/09/2025"
  },
  "timestamp": "2025-09-20T10:30:00.000Z"
}
```

## Error Handling

Tất cả endpoints đều trả về cấu trúc lỗi thống nhất:

```json
{
  "success": false,
  "message": "Khoảng thời gian không hợp lệ",
  "timestamp": "2025-09-20T10:30:00.000Z"
}
```

**Các thông báo lỗi có thể:**

- "Không có dữ liệu doanh số trong khoảng thời gian này"
- "Khoảng thời gian không hợp lệ"
- "Không thể tải dữ liệu doanh số, vui lòng thử lại sau"

## Order Status được tính

Chỉ tính các đơn hàng có trạng thái:

- `COMPLETED`: Đơn hoàn tất
- `PAID`: Đã thanh toán (Online)
- `CONFIRMED`: Shop đã xác nhận
- `SHIPPED`: Đang giao hàng

## Database Queries

Tất cả queries đều được optimize với:

- JOIN giữa các bảng liên quan
- GROUP BY để tổng hợp dữ liệu
- ORDER BY để sắp xếp kết quả
- COALESCE để xử lý NULL values
- Type casting cho số liệu chính xác
