import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateExistingDigitalKeysToNull1758078548256
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing digital keys that are linked to expired/failed orders to NULL
    // This will release all digital keys that are currently reserved but order has expired
    await queryRunner.query(`
            UPDATE digital_key 
            SET "orderItemId" = NULL, status = 'UNUSED'
            WHERE "orderItemId" IN (
                SELECT oi.id 
                FROM order_item oi
                JOIN "order" o ON oi."orderId" = o.id
                WHERE o.status IN ('FAILED', 'CANCELED') 
                   OR (o.status = 'PENDING_PAYMENT' AND o.expired_at < NOW())
            )
        `);

    console.log('Updated digital keys for expired/failed orders');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot reverse this operation safely as we don't know the original orderItemId values
    console.log('Cannot reverse digital key updates - data migration');
  }
}
