import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNullableInPayment1757857904935 implements MigrationInterface {
  name = 'AddNullableInPayment1757857904935';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "trans_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "order_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "paid_at" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "paid_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "order_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "trans_id" SET NOT NULL`,
    );
  }
}
