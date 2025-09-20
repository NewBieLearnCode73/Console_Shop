export class SalesOverviewResponseDto {
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  period: string;
}

export class DailySalesResponseDto {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
}

export class MonthlySalesResponseDto {
  month: string;
  year: number;
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
}

export class YearlySalesResponseDto {
  year: number;
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
}

export class TopSellingProductResponseDto {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  totalQuantitySold: number;
  totalRevenue: number;
  categoryName?: string;
  brandName?: string;
}

export class SalesReportResponseDto<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}
