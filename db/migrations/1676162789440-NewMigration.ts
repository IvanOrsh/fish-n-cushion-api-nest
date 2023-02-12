import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertTags1676162789440 implements MigrationInterface {
  name = 'NewMigration1676162789440';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "tags" (name) VALUES ('react'), ('angular'), ('vue'), ('node')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "tags"`);
  }
}
