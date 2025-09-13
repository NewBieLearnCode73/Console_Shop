import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteClientOrderCode1757745196282 implements MigrationInterface {
    name = 'DeleteClientOrderCode1757745196282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "client_order_code"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "client_order_code" uuid`);
    }

}
