import { MigrationInterface, QueryRunner } from "typeorm";

export class GenOrderModule1756705656408 implements MigrationInterface {
    name = 'GenOrderModule1756705656408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order_address" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "to_name" character varying NOT NULL, "to_phone" character varying NOT NULL, "to_address" character varying NOT NULL, "to_ward_code" character varying NOT NULL, "to_district_id" character varying NOT NULL, "to_province_name" character varying NOT NULL, CONSTRAINT "PK_f07603e96b068aae820d4590270" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_item" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "price" integer NOT NULL, "productVariantId" uuid, "orderId" uuid, CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('PENDING_PAYMENT', 'PAID_PENDING_SHIPMENT', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELED')`);
        await queryRunner.query(`CREATE TYPE "public"."order_order_type_enum" AS ENUM('PHYSICAL', 'DIGITAL')`);
        await queryRunner.query(`CREATE TABLE "order" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_code" character varying NOT NULL, "client_order_code" uuid NOT NULL, "sub_total" integer NOT NULL, "discount_amount" integer NOT NULL, "shipping_fee" integer NOT NULL DEFAULT '22000', "declaration_fee" integer NOT NULL, "total_amount" integer NOT NULL, "status" "public"."order_status_enum" NOT NULL DEFAULT 'PENDING_PAYMENT', "order_type" "public"."order_order_type_enum" NOT NULL, "completed_at" TIMESTAMP, "userId" uuid, "orderAddressId" uuid, CONSTRAINT "REL_b21b0291ce0f33ce11d123fcfd" UNIQUE ("orderAddressId"), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payment_method_enum" AS ENUM('COD', 'BANK_TRANSFER')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "payment" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "method" "public"."payment_method_enum" NOT NULL, "status" "public"."payment_status_enum" NOT NULL, "txnref" character varying NOT NULL, "amount" integer NOT NULL, "paid_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_7e2fe82497aa29798b51511ada4" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_b21b0291ce0f33ce11d123fcfd6" FOREIGN KEY ("orderAddressId") REFERENCES "order_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_b21b0291ce0f33ce11d123fcfd6"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_7e2fe82497aa29798b51511ada4"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_method_enum"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_order_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`DROP TABLE "order_address"`);
    }

}
