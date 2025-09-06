import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddingCostPriceForProductVariant1757155047038
  implements MigrationInterface
{
  name = 'AddingCostPriceForProductVariant1757155047038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variant" ADD "cost_price" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variant" DROP COLUMN "cost_price"`,
    );
  }
}
