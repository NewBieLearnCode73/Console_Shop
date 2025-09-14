import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWeightToProduct1757833335794 implements MigrationInterface {
    name = 'AddWeightToProduct1757833335794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "weight" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "weight"`);
    }

}
