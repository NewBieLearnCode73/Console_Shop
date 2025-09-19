import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingOrderRequestToOrder1758247383409 implements MigrationInterface {
    name = 'AddingOrderRequestToOrder1758247383409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refund_request" ADD "reviewNotes" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refund_request" DROP COLUMN "reviewNotes"`);
    }

}
