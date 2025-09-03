import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePriceColumnInOrderItem1756872244244 implements MigrationInterface {
    name = 'ChangePriceColumnInOrderItem1756872244244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "price" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_code" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "client_order_code" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "client_order_code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "order_code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "price" integer NOT NULL`);
    }

}
