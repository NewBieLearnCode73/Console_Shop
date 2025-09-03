import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingExpiredAndCancelledInOrder1756876058001 implements MigrationInterface {
    name = 'AddingExpiredAndCancelledInOrder1756876058001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "expired_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "cancelled_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "cancelled_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "expired_at"`);
    }

}
