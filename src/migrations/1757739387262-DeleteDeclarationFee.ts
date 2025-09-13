import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteDeclarationFee1757739387262 implements MigrationInterface {
    name = 'DeleteDeclarationFee1757739387262'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "declaration_fee"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "declaration_fee" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

}
