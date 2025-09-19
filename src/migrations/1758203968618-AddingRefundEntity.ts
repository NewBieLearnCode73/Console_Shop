import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingRefundEntity1758203968618 implements MigrationInterface {
    name = 'AddingRefundEntity1758203968618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."refund_request_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "refund_request" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" character varying NOT NULL, "status" "public"."refund_request_status_enum" NOT NULL DEFAULT 'PENDING', "reviewedAt" TIMESTAMP, "finalizedAt" TIMESTAMP, "orderId" uuid NOT NULL, "created_by" uuid NOT NULL, "reviewed_by" uuid, "approved_by" uuid, CONSTRAINT "REL_e4fac6b3c0dedc8c81d619abe8" UNIQUE ("orderId"), CONSTRAINT "PK_31723f412cab252cdd2005c9a26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refund" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(10,2) NOT NULL, "refundRequestId" uuid NOT NULL, CONSTRAINT "REL_6d0de7b51861fe81e11c308f39" UNIQUE ("refundRequestId"), CONSTRAINT "PK_f1cefa2e60d99b206c46c1116e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refund_request" ADD CONSTRAINT "FK_e4fac6b3c0dedc8c81d619abe8b" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refund_request" ADD CONSTRAINT "FK_7d2ad438095675250bb58bd0fe8" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refund_request" ADD CONSTRAINT "FK_eba4fcbb1b56d9bcf5a111ac721" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refund_request" ADD CONSTRAINT "FK_d7bd473e953a297f6b426127bb7" FOREIGN KEY ("approved_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refund" ADD CONSTRAINT "FK_6d0de7b51861fe81e11c308f395" FOREIGN KEY ("refundRequestId") REFERENCES "refund_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refund" DROP CONSTRAINT "FK_6d0de7b51861fe81e11c308f395"`);
        await queryRunner.query(`ALTER TABLE "refund_request" DROP CONSTRAINT "FK_d7bd473e953a297f6b426127bb7"`);
        await queryRunner.query(`ALTER TABLE "refund_request" DROP CONSTRAINT "FK_eba4fcbb1b56d9bcf5a111ac721"`);
        await queryRunner.query(`ALTER TABLE "refund_request" DROP CONSTRAINT "FK_7d2ad438095675250bb58bd0fe8"`);
        await queryRunner.query(`ALTER TABLE "refund_request" DROP CONSTRAINT "FK_e4fac6b3c0dedc8c81d619abe8b"`);
        await queryRunner.query(`DROP TABLE "refund"`);
        await queryRunner.query(`DROP TABLE "refund_request"`);
        await queryRunner.query(`DROP TYPE "public"."refund_request_status_enum"`);
    }

}
