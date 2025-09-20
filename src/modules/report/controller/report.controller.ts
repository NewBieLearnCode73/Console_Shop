import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from '../service/report.service';
import {
  GetSalesOverviewDto,
  GetSalesByDateDto,
  GetSalesByMonthDto,
  GetTopSellingProductsDto,
  GetSalesWithFiltersDto,
  GetOverallSalesDto,
  GetSalesByProductDto,
  GetSalesByCustomerDto,
  GetSalesByTimeRangeDto,
  GetProfitReportDto,
} from '../dto/request/sales-report.request.dto';
import { SalesFilters } from '../service/report.service';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';
import { RolesDecorator } from 'src/decorators/role_decorator';
import { Role } from 'src/constants/role.enum';

@Controller('api/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // **********************FOR MANAGER & ADMIN - START******************************* *//

  /**
   * GET /api/reports/sales/overview?month=9&year=2025
   */
  @Get('sales/overview')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.MANAGER, Role.ADMIN])
  async getSalesOverview(@Query() query: GetSalesOverviewDto) {
    return this.reportService.getSalesOverview(query.month, query.year);
  }

  /**
   * GET /api/reports/sales/daily?startDate=2025-09-01&endDate=2025-09-30&page=1&limit=30&sortBy=date&order=DESC
   */
  @Get('sales/daily')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.MANAGER, Role.ADMIN])
  async getSalesByDate(@Query() query: GetSalesByDateDto) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    return this.reportService.getSalesByDate(
      startDate,
      endDate,
      query.page || 1,
      query.limit || 30,
      query.sortBy || 'date',
      query.order || 'DESC',
    );
  }

  /**
   * GET /api/reports/sales/monthly?year=2025&page=1&limit=12&sortBy=month&order=ASC
   */
  @Get('sales/monthly')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.MANAGER, Role.ADMIN])
  async getSalesByMonth(@Query() query: GetSalesByMonthDto) {
    return this.reportService.getSalesByMonth(
      query.year,
      query.page || 1,
      query.limit || 12,
      query.sortBy || 'month',
      query.order || 'ASC',
    );
  }

  /**
   * GET /api/reports/sales/yearly
   */
  @Get('sales/yearly')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.MANAGER, Role.ADMIN])
  async getSalesByYear() {
    return this.reportService.getSalesByYear();
  }

  /**
   * GET /api/reports/sales/top-products?limit=10&startDate=2025-09-01&endDate=2025-09-30&page=1&sortBy=totalQuantitySold&order=DESC
   */
  @Get('sales/top-products')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.MANAGER, Role.ADMIN])
  async getTopSellingProducts(@Query() query: GetTopSellingProductsDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    return this.reportService.getTopSellingProducts(
      startDate,
      endDate,
      query.page || 1,
      query.limit || 8,
      query.sortBy || 'totalQuantitySold',
      query.order || 'DESC',
    );
  }

  /**
   * GET /api/reports/sales/filtered?startDate=2025-09-01&endDate=2025-09-30&orderType=PHYSICAL&categoryId=uuid&brandId=uuid
   */
  @Get('sales/filtered')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.MANAGER, Role.ADMIN])
  async getSalesWithFilters(@Query() query: GetSalesWithFiltersDto) {
    const filters: SalesFilters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      orderType: query.orderType,
      categoryId: query.categoryId,
      brandId: query.brandId,
      productId: query.productId,
    };
    return this.reportService.getSalesWithFilters(filters);
  }

  // **********************FOR MANAGER & ADMIN - END******************************* *//

  // **********************FOR ADMIN - START******************************* *//

  /**
   * GET /api/reports/admin/overall-sales?orderType=PHYSICAL
   */
  @Get('admin/overall-sales')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN])
  async getOverallSales(@Query() query: GetOverallSalesDto) {
    return this.reportService.getOverallSales(query.orderType);
  }

  /**
   * GET /api/reports/admin/sales-by-product?productType=DEVICE&page=1&limit=20&sortBy=totalRevenue&order=DESC
   */
  @Get('admin/sales-by-product')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN])
  async getSalesByProduct(@Query() query: GetSalesByProductDto) {
    return this.reportService.getSalesByProduct(
      query.productType,
      query.page || 1,
      query.limit || 20,
      query.sortBy || 'totalRevenue',
      query.order || 'DESC',
    );
  }

  /**
   * GET /api/reports/admin/sales-by-customer?page=1&limit=20&sortBy=totalRevenue&order=DESC&customerId=uuid&customerEmail=email
   */
  @Get('admin/sales-by-customer')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN])
  async getSalesByCustomer(@Query() query: GetSalesByCustomerDto) {
    return this.reportService.getSalesByCustomer(
      query.page || 1,
      query.limit || 20,
      query.sortBy || 'totalRevenue',
      query.order || 'DESC',
      query.customerId,
      query.customerEmail,
    );
  }

  /**
   * GET /api/reports/admin/sales-by-time-range?startDate=2025-09-01&endDate=2025-09-30
   */
  @Get('admin/sales-by-time-range')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN])
  async getSalesByTimeRange(@Query() query: GetSalesByTimeRangeDto) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    return this.reportService.getSalesByTimeRange(startDate, endDate);
  }

  /**
   * GET /api/reports/admin/profit?productType=DEVICE&orderType=PHYSICAL
   */
  @Get('admin/profit')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN])
  async getProfitReport(@Query() query: GetProfitReportDto) {
    return this.reportService.getProfitReport(
      query.productType,
      query.orderType,
    );
  }

  /**
   * GET /api/reports/admin/variant-profit/:variantId
   */
  @Get('admin/variant-profit/:variantId')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN])
  async getVariantProfitReport(
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ) {
    return this.reportService.getVariantProfitReport(variantId);
  }

  // **********************FOR ADMIN - END******************************* *//
}
