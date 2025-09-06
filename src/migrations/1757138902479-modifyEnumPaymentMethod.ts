import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyEnumPaymentMethod1757138902479
  implements MigrationInterface
{
  name = 'ModifyEnumPaymentMethod1757138902479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."payment_method_enum" RENAME TO "payment_method_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_method_enum" AS ENUM('COD', 'MOMO_WALLET')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "method" TYPE "public"."payment_method_enum" USING "method"::"text"::"public"."payment_method_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."payment_method_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."payment_method_enum_old" AS ENUM('COD', 'BANK_TRANSFER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "method" TYPE "public"."payment_method_enum_old" USING "method"::"text"::"public"."payment_method_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."payment_method_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."payment_method_enum_old" RENAME TO "payment_method_enum"`,
    );
  }
}
