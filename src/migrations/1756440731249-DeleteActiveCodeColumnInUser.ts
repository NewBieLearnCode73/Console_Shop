import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteActiveCodeColumnInUser1756440731249 implements MigrationInterface {
    name = 'DeleteActiveCodeColumnInUser1756440731249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "active_code"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "active_code" uuid NOT NULL DEFAULT uuid_generate_v4()`);
    }

}
