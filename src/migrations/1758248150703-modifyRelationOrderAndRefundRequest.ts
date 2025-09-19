import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyRelationOrderAndRefundRequest1758248150703 implements MigrationInterface {
    name = 'ModifyRelationOrderAndRefundRequest1758248150703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refund_request" DROP CONSTRAINT "FK_e4fac6b3c0dedc8c81d619abe8b"`);
        await queryRunner.query(`ALTER TABLE "refund_request" RENAME COLUMN "orderId" TO "order_id"`);
        await queryRunner.query(`ALTER TABLE "refund_request" ADD CONSTRAINT "FK_d8beefd8358d2ff894be6280be9" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refund_request" DROP CONSTRAINT "FK_d8beefd8358d2ff894be6280be9"`);
        await queryRunner.query(`ALTER TABLE "refund_request" RENAME COLUMN "order_id" TO "orderId"`);
        await queryRunner.query(`ALTER TABLE "refund_request" ADD CONSTRAINT "FK_e4fac6b3c0dedc8c81d619abe8b" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
