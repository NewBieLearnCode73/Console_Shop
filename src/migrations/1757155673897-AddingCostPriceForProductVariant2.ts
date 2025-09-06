import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddingCostPriceForProductVariant21757155673897
  implements MigrationInterface
{
  name = 'AddingCostPriceForProductVariant21757155673897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variant" ALTER COLUMN "cost_price" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variant" ALTER COLUMN "cost_price" DROP NOT NULL`,
    );
  }
}
