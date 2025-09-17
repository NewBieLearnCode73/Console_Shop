import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentMethodToOrder1758121840139 implements MigrationInterface {
    name = 'AddPaymentMethodToOrder1758121840139'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_payment_method_enum" AS ENUM('COD', 'MOMO_WALLET')`);
        await queryRunner.query(`ALTER TABLE "order" ADD "payment_method" "public"."order_payment_method_enum"`);
        
        // Update existing orders with default payment method
        await queryRunner.query(`UPDATE "order" SET "payment_method" = 'COD' WHERE "payment_method" IS NULL`);
        
        // Now set the column as NOT NULL
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "payment_method" SET NOT NULL`);
        
        // Handle payment table - First backup existing order_id values
        await queryRunner.query(`ALTER TABLE "payment" ADD "order_id_backup" character varying`);
        await queryRunner.query(`UPDATE "payment" SET "order_id_backup" = "order_id"`);
        
        // Drop constraints and old column
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "UQ_f5221735ace059250daac9d9803"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "order_id"`);
        
        // Add new column as nullable first
        await queryRunner.query(`ALTER TABLE "payment" ADD "order_id" uuid`);
        
        // Copy valid UUIDs back (only if they're valid UUID format AND order exists)
        await queryRunner.query(`
            UPDATE "payment" 
            SET "order_id" = "order_id_backup"::uuid 
            WHERE "order_id_backup" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            AND EXISTS (SELECT 1 FROM "order" WHERE "id" = "order_id_backup"::uuid)
        `);
        
        // Delete payments with invalid or non-existent order_id
        await queryRunner.query(`DELETE FROM "payment" WHERE "order_id" IS NULL`);
        
        // Now set NOT NULL and add constraints
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "order_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "UQ_f5221735ace059250daac9d9803" UNIQUE ("order_id")`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_f5221735ace059250daac9d9803" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // Clean up backup column
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "order_id_backup"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_f5221735ace059250daac9d9803"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "UQ_f5221735ace059250daac9d9803"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "order_id"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "order_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "UQ_f5221735ace059250daac9d9803" UNIQUE ("order_id")`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "payment_method"`);
        await queryRunner.query(`DROP TYPE "public"."order_payment_method_enum"`);
    }

}
