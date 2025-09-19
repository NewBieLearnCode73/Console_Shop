import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingConstraintDeleteOnRefund1758250328317 implements MigrationInterface {
    name = 'AddingConstraintDeleteOnRefund1758250328317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refund" DROP CONSTRAINT "FK_6d0de7b51861fe81e11c308f395"`);
        await queryRunner.query(`ALTER TABLE "refund" ADD CONSTRAINT "FK_6d0de7b51861fe81e11c308f395" FOREIGN KEY ("refundRequestId") REFERENCES "refund_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refund" DROP CONSTRAINT "FK_6d0de7b51861fe81e11c308f395"`);
        await queryRunner.query(`ALTER TABLE "refund" ADD CONSTRAINT "FK_6d0de7b51861fe81e11c308f395" FOREIGN KEY ("refundRequestId") REFERENCES "refund_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
