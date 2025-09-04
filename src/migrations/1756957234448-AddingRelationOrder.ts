import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingRelationOrder1756957234448 implements MigrationInterface {
    name = 'AddingRelationOrder1756957234448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "digital_key" ADD "orderItemId" uuid`);
        await queryRunner.query(`ALTER TABLE "digital_key" ADD CONSTRAINT "UQ_658f9152f88ad68623eb87b9969" UNIQUE ("orderItemId")`);
        await queryRunner.query(`ALTER TYPE "public"."digital_key_status_enum" RENAME TO "digital_key_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."digital_key_status_enum" AS ENUM('UNUSED', 'USED')`);
        await queryRunner.query(`ALTER TABLE "digital_key" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "digital_key" ALTER COLUMN "status" TYPE "public"."digital_key_status_enum" USING "status"::"text"::"public"."digital_key_status_enum"`);
        await queryRunner.query(`ALTER TABLE "digital_key" ALTER COLUMN "status" SET DEFAULT 'UNUSED'`);
        await queryRunner.query(`DROP TYPE "public"."digital_key_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "digital_key" ADD CONSTRAINT "FK_658f9152f88ad68623eb87b9969" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "digital_key" DROP CONSTRAINT "FK_658f9152f88ad68623eb87b9969"`);
        await queryRunner.query(`CREATE TYPE "public"."digital_key_status_enum_old" AS ENUM('UNUSED', 'USED', 'EXPIRED')`);
        await queryRunner.query(`ALTER TABLE "digital_key" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "digital_key" ALTER COLUMN "status" TYPE "public"."digital_key_status_enum_old" USING "status"::"text"::"public"."digital_key_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "digital_key" ALTER COLUMN "status" SET DEFAULT 'UNUSED'`);
        await queryRunner.query(`DROP TYPE "public"."digital_key_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."digital_key_status_enum_old" RENAME TO "digital_key_status_enum"`);
        await queryRunner.query(`ALTER TABLE "digital_key" DROP CONSTRAINT "UQ_658f9152f88ad68623eb87b9969"`);
        await queryRunner.query(`ALTER TABLE "digital_key" DROP COLUMN "orderItemId"`);
    }

}
