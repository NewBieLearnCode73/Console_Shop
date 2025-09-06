import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyDefaultStatusOrder1757133757648 implements MigrationInterface {
    name = 'ModifyDefaultStatusOrder1757133757648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "txnref"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "trans_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "UQ_47416d3896aa6523b7c0a16f426" UNIQUE ("trans_id")`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "order_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "UQ_f5221735ace059250daac9d9803" UNIQUE ("order_id")`);
        await queryRunner.query(`ALTER TYPE "public"."order_status_enum" RENAME TO "order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('PENDING_CONFIRMATION', 'PENDING_PAYMENT', 'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELED', 'FAILED', 'RETURNED')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum" USING "status"::"text"::"public"."order_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum_old" AS ENUM('PENDING_PAYMENT', 'PAID_PENDING_SHIPMENT', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum_old" USING "status"::"text"::"public"."order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT'`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_status_enum_old" RENAME TO "order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "UQ_f5221735ace059250daac9d9803"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "order_id"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "UQ_47416d3896aa6523b7c0a16f426"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "trans_id"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "txnref" character varying NOT NULL`);
    }

}
