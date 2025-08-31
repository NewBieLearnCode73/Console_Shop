import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePriceInCartItem1756622356110 implements MigrationInterface {
    name = 'RemovePriceInCartItem1756622356110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_item" DROP COLUMN "price"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_item" ADD "price" numeric(10,2) NOT NULL`);
    }

}
