import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingHashkeycodeColumn1756283536746 implements MigrationInterface {
    name = 'AddingHashkeycodeColumn1756283536746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "digital_key" ADD "hash_key_code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "digital_key" ADD CONSTRAINT "UQ_c8966d93461cf165208970f4f36" UNIQUE ("hash_key_code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "digital_key" DROP CONSTRAINT "UQ_c8966d93461cf165208970f4f36"`);
        await queryRunner.query(`ALTER TABLE "digital_key" DROP COLUMN "hash_key_code"`);
    }

}
