import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderType } from 'src/constants/order_type.enum';
import { PaginationResult } from 'src/utils/pagination/pagination_result';

interface SalesQueryResult {
  totalOrders: string;
  totalRevenue: string;
  totalProductsSold: string;
}

export interface SalesOverviewData {
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  period: string;
}

export interface DailySalesData {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
}

export interface MonthlySalesData {
  month: string;
  year: number;
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
}

export interface YearlySalesData {
  year: number;
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
}

export interface TopSellingProduct {
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

export interface SalesFilters {
  startDate?: Date;
  endDate?: Date;
  orderType?: OrderType; // PHYSICAL / DIGITAL
  categoryId?: string;
  brandId?: string;
  productId?: string;
}

export enum SalesReportType {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  TOP_PRODUCTS = 'top_products',
}

// **********************FOR ADMIN REPORTS - INTERFACES******************************* *//
export interface OverallSalesData {
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  period: string;
  orderType?: OrderType;
}

export interface ProductSalesData {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  sku?: string;
  productType?: string; // DEVICE, CARD_PHYSICAL, CARD_DIGITAL_KEY
  totalQuantitySold: number;
  totalRevenue: number;
  categoryName?: string;
  brandName?: string;
}

export interface CustomerSalesData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  firstOrderDate?: Date;
  lastOrderDate?: Date;
}

export interface TimeRangeSalesData {
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  startDate: Date;
  endDate: Date;
  period: string;
}

export interface ProfitData {
  totalProfit: number;
  totalRevenue: number;
  profitMargin: number;
  totalCost: number;
  productType?: string;
  orderType?: OrderType;
}

export interface ProductProfitData {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  sku?: string;
  productType?: string;
  quantitySold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
}

export interface VariantProfitData {
  variantId: string;
  variantName: string;
  sku: string;
  productId: string;
  productName: string;
  productType?: string;
  categoryName?: string;
  brandName?: string;
  quantitySold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
}

@Injectable()
export class ReportService {
  constructor(private readonly dataSource: DataSource) {}

  // **********************FOR MANAGER - START******************************* *//

  async getSalesOverview(
    month?: number,
    year?: number,
  ): Promise<SalesOverviewData> {
    const currentDate = new Date();
    const targetMonth = month ?? currentDate.getMonth() + 1;
    const targetYear = year ?? currentDate.getFullYear();

    // Tạo khoảng thời gian cho tháng
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    try {
      const query = `
        SELECT 
          COUNT(DISTINCT o.id) as "totalOrders",
          COALESCE(SUM(CAST(oi.price as DECIMAL) * oi.quantity), 0) as "totalRevenue",
          COALESCE(SUM(oi.quantity), 0) as "totalProductsSold"
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment p ON o.id = p.order_id
        WHERE o.status = 'COMPLETED'
          AND p.status = 'SUCCESS'
          AND o."createdAt" >= $1
          AND o."createdAt" <= $2
      `;

      const result = await this.dataSource.query(query, [startDate, endDate]);

      const data = result[0] || {
        totalOrders: '0',
        totalRevenue: '0',
        totalProductsSold: '0',
      };

      return {
        totalOrders: parseInt(data.totalOrders) || 0,
        totalRevenue: parseFloat(data.totalRevenue) || 0,
        totalProductsSold: parseInt(data.totalProductsSold) || 0,
        period: `${targetMonth}/${targetYear}`,
      };
    } catch (error) {
      console.error('Error getting sales overview:', error);
      throw new InternalServerErrorException(
        'Unable to load sales data, please try again later',
      );
    }
  }

  async getSalesByDate(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 8,
    sortBy: string = 'date',
    order: 'ASC' | 'DESC' = 'DESC',
  ) {
    if (startDate > endDate) {
      throw new BadRequestException('Invalid date range');
    }

    try {
      // Query để đếm tổng số bản ghi
      const countQuery = `
        SELECT COUNT(DISTINCT DATE(o."createdAt")) as total
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment p ON o.id = p.order_id
        WHERE o.status = 'COMPLETED'
          AND p.status = 'SUCCESS'
          AND DATE(o."createdAt") >= DATE($1)
          AND DATE(o."createdAt") <= DATE($2)
      `;

      const countResult = await this.dataSource.query(countQuery, [
        startDate,
        endDate,
      ]);
      const total = parseInt(countResult[0]?.total || '0');

      if (total === 0) {
        return PaginationResult([], 0, page, limit);
      }

      // Query chính với pagination
      const offset = (page - 1) * limit;
      const orderDirection = order === 'ASC' ? 'ASC' : 'DESC';
      const sortColumn =
        sortBy === 'date'
          ? 'DATE(o."createdAt")'
          : sortBy === 'totalOrders'
            ? 'COUNT(DISTINCT o.id)'
            : sortBy === 'totalRevenue'
              ? 'SUM(CAST(oi.price as DECIMAL) * oi.quantity)'
              : sortBy === 'totalProductsSold'
                ? 'SUM(oi.quantity)'
                : 'DATE(o."createdAt")';

      const query = `
        SELECT 
          DATE(o."createdAt") as "date",
          COUNT(DISTINCT o.id) as "totalOrders",
          COALESCE(SUM(CAST(oi.price as DECIMAL) * oi.quantity), 0) as "totalRevenue",
          COALESCE(SUM(oi.quantity), 0) as "totalProductsSold"
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment p ON o.id = p.order_id
        WHERE o.status = 'COMPLETED'
          AND p.status = 'SUCCESS'
          AND DATE(o."createdAt") >= DATE($1)
          AND DATE(o."createdAt") <= DATE($2)
        GROUP BY DATE(o."createdAt")
        ORDER BY ${sortColumn} ${orderDirection}
        LIMIT $3 OFFSET $4
      `;

      const result = await this.dataSource.query(query, [
        startDate,
        endDate,
        limit,
        offset,
      ]);

      const data = result.map((row) => ({
        date: row.date,
        totalOrders: parseInt(row.totalOrders) || 0,
        totalRevenue: parseFloat(row.totalRevenue) || 0,
        totalProductsSold: parseInt(row.totalProductsSold) || 0,
      }));

      return PaginationResult(data, total, page, limit);
    } catch (error) {
      console.error('Error getting daily sales:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to load sales data, please try again later',
      );
    }
  }

  async getSalesByMonth(
    year?: number,
    page: number = 1,
    limit: number = 8,
    sortBy: string = 'month',
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    const targetYear = year ?? new Date().getFullYear();

    try {
      const countQuery = `
        SELECT COUNT(DISTINCT EXTRACT(MONTH FROM o."createdAt")) as total
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment p ON o.id = p.order_id
        WHERE o.status = 'COMPLETED'
          AND p.status = 'SUCCESS'
          AND EXTRACT(YEAR FROM o."createdAt") = $1
      `;

      const countResult = await this.dataSource.query(countQuery, [targetYear]);
      const total = parseInt(countResult[0]?.total || '0');

      if (total === 0) {
        return PaginationResult([], 0, page, limit);
      }

      const offset = (page - 1) * limit;
      const orderDirection = order === 'ASC' ? 'ASC' : 'DESC';
      const sortColumn =
        sortBy === 'month'
          ? 'EXTRACT(MONTH FROM o."createdAt")'
          : sortBy === 'totalOrders'
            ? 'COUNT(DISTINCT o.id)'
            : sortBy === 'totalRevenue'
              ? 'SUM(CAST(oi.price as DECIMAL) * oi.quantity)'
              : sortBy === 'totalProductsSold'
                ? 'SUM(oi.quantity)'
                : 'EXTRACT(MONTH FROM o."createdAt")';

      const query = `
        SELECT 
          EXTRACT(MONTH FROM o."createdAt") as "month",
          EXTRACT(YEAR FROM o."createdAt") as "year",
          COUNT(DISTINCT o.id) as "totalOrders",
          COALESCE(SUM(CAST(oi.price as DECIMAL) * oi.quantity), 0) as "totalRevenue",
          COALESCE(SUM(oi.quantity), 0) as "totalProductsSold"
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment p ON o.id = p.order_id
        WHERE o.status = 'COMPLETED'
          AND p.status = 'SUCCESS'
          AND EXTRACT(YEAR FROM o."createdAt") = $1
        GROUP BY EXTRACT(MONTH FROM o."createdAt"), EXTRACT(YEAR FROM o."createdAt")
        ORDER BY ${sortColumn} ${orderDirection}
        LIMIT $2 OFFSET $3
      `;

      const result = await this.dataSource.query(query, [
        targetYear,
        limit,
        offset,
      ]);

      const data = result.map((row) => ({
        month: `${parseInt(row.month)}/${row.year}`,
        year: parseInt(row.year),
        totalOrders: parseInt(row.totalOrders) || 0,
        totalRevenue: parseFloat(row.totalRevenue) || 0,
        totalProductsSold: parseInt(row.totalProductsSold) || 0,
      }));

      return PaginationResult(data, total, page, limit);
    } catch (error) {
      console.error('Error getting monthly sales:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to load sales data, please try again later',
      );
    }
  }

  async getSalesByYear(): Promise<YearlySalesData[]> {
    try {
      const query = `
        SELECT 
          EXTRACT(YEAR FROM o."createdAt") as "year",
          COUNT(DISTINCT o.id) as "totalOrders",
          COALESCE(SUM(CAST(oi.price as DECIMAL) * oi.quantity), 0) as "totalRevenue",
          COALESCE(SUM(oi.quantity), 0) as "totalProductsSold"
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment p ON o.id = p.order_id
        WHERE o.status = 'COMPLETED'
          AND p.status = 'SUCCESS'
        GROUP BY EXTRACT(YEAR FROM o."createdAt")
        ORDER BY EXTRACT(YEAR FROM o."createdAt") DESC
      `;

      const result = await this.dataSource.query(query);

      if (result.length === 0) {
        return [];
      }

      return result.map((row) => ({
        year: parseInt(row.year),
        totalOrders: parseInt(row.totalOrders) || 0,
        totalRevenue: parseFloat(row.totalRevenue) || 0,
        totalProductsSold: parseInt(row.totalProductsSold) || 0,
      }));
    } catch (error) {
      console.error('Error getting yearly sales:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to load sales data, please try again later',
      );
    }
  }

  async getTopSellingProducts(
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 8,
    sortBy: string = 'totalQuantitySold',
    order: 'ASC' | 'DESC' = 'DESC',
  ) {
    try {
      let dateCondition = '';
      const params: any[] = [];

      if (startDate && endDate) {
        if (startDate > endDate) {
          throw new BadRequestException('Invalid date range');
        }
        dateCondition = 'AND o."createdAt" >= $1 AND o."createdAt" <= $2';
        params.push(startDate, endDate);
      }

      const countQuery = `
        SELECT COUNT(DISTINCT CONCAT(p.id, '-', pv.id)) as total
        FROM order_item oi
        INNER JOIN "order" o ON oi."orderId" = o.id
        INNER JOIN payment pay ON o.id = pay.order_id
        INNER JOIN product_variant pv ON oi."productVariantId" = pv.id
        INNER JOIN product p ON pv."productId" = p.id
        WHERE o.status = 'COMPLETED'
          AND pay.status = 'SUCCESS'
          ${dateCondition}
      `;

      const countResult = await this.dataSource.query(countQuery, [...params]);
      const total = parseInt(countResult[0]?.total || '0');

      if (total === 0) {
        return PaginationResult([], 0, page, limit);
      }

      const offset = (page - 1) * limit;
      const orderDirection = order === 'ASC' ? 'ASC' : 'DESC';
      const sortColumn =
        sortBy === 'totalQuantitySold'
          ? 'SUM(oi.quantity)'
          : sortBy === 'totalRevenue'
            ? 'SUM(CAST(oi.price as DECIMAL) * oi.quantity)'
            : sortBy === 'productName'
              ? 'p.name'
              : sortBy === 'variantName'
                ? 'pv.variant_name'
                : 'SUM(oi.quantity)';

      const query = `
        SELECT 
          p.id as "productId",
          p.name as "productName",
          pv.id as "variantId",
          pv.variant_name as "variantName",
          pv.sku as "sku",
          SUM(oi.quantity) as "totalQuantitySold",
          SUM(CAST(oi.price as DECIMAL) * oi.quantity) as "totalRevenue",
          c.name as "categoryName",
          b.name as "brandName"
        FROM order_item oi
        INNER JOIN "order" o ON oi."orderId" = o.id
        INNER JOIN payment pay ON o.id = pay.order_id
        INNER JOIN product_variant pv ON oi."productVariantId" = pv.id
        INNER JOIN product p ON pv."productId" = p.id
        LEFT JOIN category c ON p."categoryId" = c.id
        LEFT JOIN brand b ON p."brandId" = b.id
        WHERE o.status = 'COMPLETED'
          AND pay.status = 'SUCCESS'
          ${dateCondition}
        GROUP BY p.id, p.name, pv.id, pv.variant_name, pv.sku, c.name, b.name
        ORDER BY ${sortColumn} ${orderDirection}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      params.push(limit, offset);

      const result = await this.dataSource.query(query, params);

      const data = result.map((row) => ({
        productId: row.productId,
        productName: row.productName,
        variantId: row.variantId,
        variantName: row.variantName,
        sku: row.sku,
        totalQuantitySold: parseInt(row.totalQuantitySold) || 0,
        totalRevenue: parseFloat(row.totalRevenue) || 0,
        categoryName: row.categoryName || undefined,
        brandName: row.brandName || undefined,
      }));

      return PaginationResult(data, total, page, limit);
    } catch (error) {
      console.error('Error getting top selling products:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to load sales data, please try again later',
      );
    }
  }

  async getSalesWithFilters(filters: SalesFilters): Promise<SalesOverviewData> {
    try {
      const conditions: string[] = [
        "o.status = 'COMPLETED'",
        "p.status = 'SUCCESS'",
      ];
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.startDate && filters.endDate) {
        if (filters.startDate > filters.endDate) {
          throw new BadRequestException('Invalid date range');
        }
        conditions.push(`o."createdAt" >= $${paramIndex}`);
        params.push(filters.startDate);
        paramIndex++;
        conditions.push(`o."createdAt" <= $${paramIndex}`);
        params.push(filters.endDate);
        paramIndex++;
      }

      if (filters.orderType) {
        conditions.push(`o.order_type = $${paramIndex}`);
        params.push(filters.orderType);
        paramIndex++;
      }

      if (filters.categoryId) {
        conditions.push(`prod."categoryId" = $${paramIndex}`);
        params.push(filters.categoryId);
        paramIndex++;
      }

      if (filters.brandId) {
        conditions.push(`prod."brandId" = $${paramIndex}`);
        params.push(filters.brandId);
        paramIndex++;
      }

      if (filters.productId) {
        conditions.push(`prod.id = $${paramIndex}`);
        params.push(filters.productId);
        paramIndex++;
      }

      const query = `
        SELECT 
          COUNT(DISTINCT o.id) as "totalOrders",
          COALESCE(SUM(CAST(oi.price as DECIMAL) * oi.quantity), 0) as "totalRevenue",
          COALESCE(SUM(oi.quantity), 0) as "totalProductsSold"
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment p ON o.id = p.order_id
        INNER JOIN product_variant pv ON oi."productVariantId" = pv.id
        INNER JOIN product prod ON pv."productId" = prod.id
        WHERE ${conditions.join(' AND ')}
      `;

      const result = await this.dataSource.query(query, params);

      const data = result[0] || {
        totalOrders: '0',
        totalRevenue: '0',
        totalProductsSold: '0',
      };

      let period = 'Tùy chỉnh';
      if (filters.startDate && filters.endDate) {
        period = `${filters.startDate.toLocaleDateString('vi-VN')} - ${filters.endDate.toLocaleDateString('vi-VN')}`;
      }

      return {
        totalOrders: parseInt(data.totalOrders) || 0,
        totalRevenue: parseFloat(data.totalRevenue) || 0,
        totalProductsSold: parseInt(data.totalProductsSold) || 0,
        period,
      };
    } catch (error) {
      console.error('Error getting filtered sales:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to load sales data, please try again later',
      );
    }
  }

  // **********************FOR MANAGER - END******************************* *//

  // **********************FOR ADMIN - START******************************* *//

  async getOverallSales(orderType?: OrderType): Promise<OverallSalesData> {
    try {
      let orderTypeCondition = '';
      const params: any[] = [];

      if (orderType) {
        orderTypeCondition = 'AND o.order_type = $1';
        params.push(orderType);
      }

      const query = `
        SELECT 
          COUNT(DISTINCT o.id) as "totalOrders",
          COALESCE(SUM(CAST(oi.price as DECIMAL) * oi.quantity), 0) as "totalRevenue",
          COALESCE(SUM(oi.quantity), 0) as "totalProductsSold"
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment p ON o.id = p.order_id
        WHERE o.status = 'COMPLETED'
          AND p.status = 'SUCCESS'
          ${orderTypeCondition}
      `;

      const result = await this.dataSource.query(query, params);
      const data = result[0] || {
        totalOrders: '0',
        totalRevenue: '0',
        totalProductsSold: '0',
      };

      return {
        totalOrders: parseInt(data.totalOrders) || 0,
        totalRevenue: parseFloat(data.totalRevenue) || 0,
        totalProductsSold: parseInt(data.totalProductsSold) || 0,
        period: 'Tất cả thời gian',
        orderType,
      };
    } catch (error) {
      console.error('Error getting overall sales:', error);
      throw new InternalServerErrorException(
        'Unable to load overall sales data',
      );
    }
  }

  async getSalesByProduct(
    productType?: string,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'totalRevenue',
    order: 'ASC' | 'DESC' = 'DESC',
  ) {
    try {
      let productTypeCondition = '';
      const params: any[] = [];

      if (productType) {
        productTypeCondition = 'AND p.product_type = $1';
        params.push(productType);
      }

      const countQuery = `
        SELECT COUNT(DISTINCT CONCAT(p.id, '-', pv.id)) as total
        FROM order_item oi
        INNER JOIN "order" o ON oi."orderId" = o.id
        INNER JOIN payment pay ON o.id = pay.order_id
        INNER JOIN product_variant pv ON oi."productVariantId" = pv.id
        INNER JOIN product p ON pv."productId" = p.id
        WHERE o.status = 'COMPLETED'
          AND pay.status = 'SUCCESS'
          ${productTypeCondition}
      `;

      const countResult = await this.dataSource.query(countQuery, [...params]);
      const total = parseInt(countResult[0]?.total || '0');

      if (total === 0) {
        return PaginationResult([], 0, page, limit);
      }

      const offset = (page - 1) * limit;
      const orderDirection = order === 'ASC' ? 'ASC' : 'DESC';
      const sortColumn =
        sortBy === 'totalQuantitySold'
          ? 'SUM(oi.quantity)'
          : sortBy === 'totalRevenue'
            ? 'SUM(CAST(oi.price as DECIMAL) * oi.quantity)'
            : sortBy === 'productName'
              ? 'p.name'
              : sortBy === 'variantName'
                ? 'pv.variant_name'
                : 'SUM(CAST(oi.price as DECIMAL) * oi.quantity)';

      const query = `
        SELECT 
          p.id as "productId",
          p.name as "productName",
          pv.id as "variantId",
          pv.variant_name as "variantName",
          pv.sku as "sku",
          p.product_type as "productType",
          SUM(oi.quantity) as "totalQuantitySold",
          SUM(CAST(oi.price as DECIMAL) * oi.quantity) as "totalRevenue",
          c.name as "categoryName",
          b.name as "brandName"
        FROM order_item oi
        INNER JOIN "order" o ON oi."orderId" = o.id
        INNER JOIN payment pay ON o.id = pay.order_id
        INNER JOIN product_variant pv ON oi."productVariantId" = pv.id
        INNER JOIN product p ON pv."productId" = p.id
        LEFT JOIN category c ON p."categoryId" = c.id
        LEFT JOIN brand b ON p."brandId" = b.id
        WHERE o.status = 'COMPLETED'
          AND pay.status = 'SUCCESS'
          ${productTypeCondition}
        GROUP BY p.id, p.name, pv.id, pv.variant_name, pv.sku, p.product_type, c.name, b.name
        ORDER BY ${sortColumn} ${orderDirection}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      params.push(limit, offset);

      const result = await this.dataSource.query(query, params);

      const data: ProductSalesData[] = result.map((row) => ({
        productId: row.productId,
        productName: row.productName,
        variantId: row.variantId,
        variantName: row.variantName,
        sku: row.sku,
        productType: row.productType,
        totalQuantitySold: parseInt(row.totalQuantitySold) || 0,
        totalRevenue: parseFloat(row.totalRevenue) || 0,
        categoryName: row.categoryName || undefined,
        brandName: row.brandName || undefined,
      }));

      return PaginationResult(data, total, page, limit);
    } catch (error) {
      console.error('Error getting sales by product:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to load product sales data',
      );
    }
  }

  async getSalesByCustomer(
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'totalRevenue',
    order: 'ASC' | 'DESC' = 'DESC',
    customerId?: string,
    customerEmail?: string,
  ) {
    try {
      const conditions = [
        "o.status = 'COMPLETED'",
        "p.status = 'SUCCESS'",
        "u.role = 'CUSTOMER'",
      ];
      const params: any[] = [];
      let paramIndex = 1;

      if (customerId) {
        conditions.push(`u.id = $${paramIndex}`);
        params.push(customerId);
        paramIndex++;
      } else if (customerEmail) {
        conditions.push(`u.email ILIKE $${paramIndex}`);
        params.push(`%${customerEmail}%`);
        paramIndex++;
      }

      const countQuery = `
        SELECT COUNT(DISTINCT o."userId") as total
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment p ON o.id = p.order_id
        INNER JOIN "user" u ON o."userId" = u.id
        WHERE ${conditions.join(' AND ')}
      `;

      const countResult = await this.dataSource.query(countQuery, [...params]);
      const total = parseInt(countResult[0]?.total || '0');

      if (total === 0) {
        return PaginationResult([], 0, page, limit);
      }

      const offset = (page - 1) * limit;
      const orderDirection = order === 'ASC' ? 'ASC' : 'DESC';
      const sortColumn =
        sortBy === 'totalOrders'
          ? 'COUNT(DISTINCT o.id)'
          : sortBy === 'totalRevenue'
            ? 'SUM(CAST(oi.price as DECIMAL) * oi.quantity)'
            : sortBy === 'avgOrderValue'
              ? 'AVG(CAST(oi.price as DECIMAL) * oi.quantity)'
              : sortBy === 'customerName'
                ? 'pr.fullname'
                : sortBy === 'firstOrderDate'
                  ? 'MIN(o."createdAt")'
                  : sortBy === 'lastOrderDate'
                    ? 'MAX(o."createdAt")'
                    : 'SUM(CAST(oi.price as DECIMAL) * oi.quantity)';

      const query = `
        SELECT 
          u.id as "customerId",
          COALESCE(pr.fullname, 'N/A') as "customerName",
          u.email as "customerEmail",
          COUNT(DISTINCT o.id) as "totalOrders",
          SUM(CAST(oi.price as DECIMAL) * oi.quantity) as "totalRevenue",
          AVG(CAST(oi.price as DECIMAL) * oi.quantity) as "avgOrderValue",
          MIN(o."createdAt") as "firstOrderDate",
          MAX(o."createdAt") as "lastOrderDate"
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment p ON o.id = p.order_id
        INNER JOIN "user" u ON o."userId" = u.id
        LEFT JOIN profile pr ON u.id = pr.user_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY u.id, pr.fullname, u.email
        ORDER BY ${sortColumn} ${orderDirection}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(limit, offset);

      const result = await this.dataSource.query(query, params);

      const data: CustomerSalesData[] = result.map((row) => ({
        customerId: row.customerId,
        customerName: row.customerName,
        customerEmail: row.customerEmail,
        totalOrders: parseInt(row.totalOrders) || 0,
        totalRevenue: parseFloat(row.totalRevenue) || 0,
        avgOrderValue: parseFloat(row.avgOrderValue) || 0,
        firstOrderDate: row.firstOrderDate
          ? new Date(row.firstOrderDate)
          : undefined,
        lastOrderDate: row.lastOrderDate
          ? new Date(row.lastOrderDate)
          : undefined,
      }));

      return PaginationResult(data, total, page, limit);
    } catch (error) {
      console.error('Error getting sales by customer:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to load customer sales data',
      );
    }
  }

  async getSalesByTimeRange(
    startDate: Date,
    endDate: Date,
  ): Promise<TimeRangeSalesData> {
    if (startDate > endDate) {
      throw new BadRequestException('Invalid date range');
    }

    try {
      const query = `
        SELECT 
          COUNT(DISTINCT o.id) as "totalOrders",
          COALESCE(SUM(CAST(oi.price as DECIMAL) * oi.quantity), 0) as "totalRevenue",
          COALESCE(SUM(oi.quantity), 0) as "totalProductsSold"
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment p ON o.id = p.order_id
        WHERE o.status = 'COMPLETED'
          AND p.status = 'SUCCESS'
          AND o."createdAt" >= $1
          AND o."createdAt" <= $2
      `;

      const result = await this.dataSource.query(query, [startDate, endDate]);
      const data = result[0] || {
        totalOrders: '0',
        totalRevenue: '0',
        totalProductsSold: '0',
      };

      if (parseInt(data.totalOrders) === 0) {
        throw new NotFoundException('No orders found in this time range');
      }

      return {
        totalOrders: parseInt(data.totalOrders) || 0,
        totalRevenue: parseFloat(data.totalRevenue) || 0,
        totalProductsSold: parseInt(data.totalProductsSold) || 0,
        startDate,
        endDate,
        period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      };
    } catch (error) {
      console.error('Error getting sales by time range:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to load sales data by time range',
      );
    }
  }

  async getProfitReport(
    productType?: string,
    orderType?: OrderType,
  ): Promise<ProfitData> {
    try {
      const conditions: string[] = [
        "o.status = 'COMPLETED'",
        "pay.status = 'SUCCESS'",
      ];
      const params: any[] = [];
      let paramIndex = 1;

      if (productType) {
        conditions.push(`p.product_type = $${paramIndex}`);
        params.push(productType);
        paramIndex++;
      }

      if (orderType) {
        conditions.push(`o.order_type = $${paramIndex}`);
        params.push(orderType);
        paramIndex++;
      }

      const query = `
        SELECT 
          SUM(CAST(oi.price as DECIMAL) * oi.quantity) as "totalRevenue",
          SUM(CAST(pv.cost_price as DECIMAL) * oi.quantity) as "totalCost",
          SUM((CAST(oi.price as DECIMAL) - CAST(pv.cost_price as DECIMAL)) * oi.quantity) as "totalProfit"
        FROM "order" o
        INNER JOIN order_item oi ON o.id = oi."orderId"
        INNER JOIN payment pay ON o.id = pay.order_id
        INNER JOIN product_variant pv ON oi."productVariantId" = pv.id
        INNER JOIN product p ON pv."productId" = p.id
        WHERE ${conditions.join(' AND ')}
      `;

      const result = await this.dataSource.query(query, params);
      const data = result[0] || {
        totalRevenue: '0',
        totalCost: '0',
        totalProfit: '0',
      };

      const totalRevenue = parseFloat(data.totalRevenue) || 0;
      const totalCost = parseFloat(data.totalCost) || 0;
      const totalProfit = parseFloat(data.totalProfit) || 0;

      if (totalRevenue === 0) {
        throw new NotFoundException('No profit data found');
      }

      return {
        totalProfit,
        totalRevenue,
        totalCost,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        productType,
        orderType,
      };
    } catch (error) {
      console.error('Error getting profit report:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Unable to load profit data');
    }
  }

  async getVariantProfitReport(variantId: string): Promise<VariantProfitData> {
    try {
      const query = `
        SELECT 
          pv.id as "variantId",
          pv.variant_name as "variantName",
          pv.sku as "sku",
          p.id as "productId",
          p.name as "productName",
          p.product_type as "productType",
          c.name as "categoryName",
          b.name as "brandName",
          COALESCE(SUM(oi.quantity), 0) as "quantitySold",
          COALESCE(SUM(CAST(oi.price as DECIMAL) * oi.quantity), 0) as "totalRevenue",
          COALESCE(SUM(CAST(pv.cost_price as DECIMAL) * oi.quantity), 0) as "totalCost",
          COALESCE(SUM((CAST(oi.price as DECIMAL) - CAST(pv.cost_price as DECIMAL)) * oi.quantity), 0) as "totalProfit"
        FROM product_variant pv
        INNER JOIN product p ON pv."productId" = p.id
        LEFT JOIN category c ON p."categoryId" = c.id
        LEFT JOIN brand b ON p."brandId" = b.id
        LEFT JOIN order_item oi ON pv.id = oi."productVariantId"
        LEFT JOIN "order" o ON oi."orderId" = o.id
        LEFT JOIN payment pay ON o.id = pay.order_id
        WHERE pv.id = $1
          AND (o.id IS NULL OR (o.status = 'COMPLETED' AND pay.status = 'SUCCESS'))
        GROUP BY pv.id, pv.variant_name, pv.sku, p.id, p.name, p.product_type, c.name, b.name
      `;

      const result = await this.dataSource.query(query, [variantId]);

      if (result.length === 0) {
        throw new NotFoundException('Variant not found');
      }

      const data = result[0];
      const totalRevenue = parseFloat(data.totalRevenue) || 0;
      const totalCost = parseFloat(data.totalCost) || 0;
      const totalProfit = parseFloat(data.totalProfit) || 0;
      const quantitySold = parseInt(data.quantitySold) || 0;

      return {
        variantId: data.variantId,
        variantName: data.variantName,
        sku: data.sku,
        productId: data.productId,
        productName: data.productName,
        productType: data.productType,
        categoryName: data.categoryName,
        brandName: data.brandName,
        quantitySold,
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting variant profit report:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to load variant profit data',
      );
    }
  }

  // **********************FOR ADMIN - END******************************* *//
}
