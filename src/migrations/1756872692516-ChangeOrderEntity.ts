import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeOrderEntity1756872692516 implements MigrationInterface {
  name = 'ChangeOrderEntity1756872692516';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN "discount_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "discount_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "shipping_fee"`);
    await queryRunner.query(
      `ALTER TABLE "order" ADD "shipping_fee" numeric(10,2) NOT NULL DEFAULT '22000'`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN "declaration_fee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "declaration_fee" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total_amount"`);
    await queryRunner.query(
      `ALTER TABLE "order" ADD "total_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total_amount"`);
    await queryRunner.query(
      `ALTER TABLE "order" ADD "total_amount" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN "declaration_fee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "declaration_fee" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "shipping_fee"`);
    await queryRunner.query(
      `ALTER TABLE "order" ADD "shipping_fee" integer NOT NULL DEFAULT '22000'`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN "discount_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "discount_amount" integer NOT NULL`,
    );
  }
}
