import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingSizeForProduct1758989279048 implements MigrationInterface {
    name = 'AddingSizeForProduct1758989279048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "height" integer DEFAULT '10'`);
        await queryRunner.query(`ALTER TABLE "product" ADD "width" integer DEFAULT '10'`);
        await queryRunner.query(`ALTER TABLE "product" ADD "length" integer DEFAULT '10'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "length"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "width"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "height"`);
    }

}
