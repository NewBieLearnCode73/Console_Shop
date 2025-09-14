import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDistrictIdToNumeric1757819742965 implements MigrationInterface {
    name = 'ChangeDistrictIdToNumeric1757819742965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "to_district_id"`);
        await queryRunner.query(`ALTER TABLE "address" ADD "to_district_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_address" DROP COLUMN "to_district_id"`);
        await queryRunner.query(`ALTER TABLE "order_address" ADD "to_district_id" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_address" DROP COLUMN "to_district_id"`);
        await queryRunner.query(`ALTER TABLE "order_address" ADD "to_district_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "to_district_id"`);
        await queryRunner.query(`ALTER TABLE "address" ADD "to_district_id" character varying NOT NULL`);
    }

}
