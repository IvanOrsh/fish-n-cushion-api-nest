import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1676820025653 implements MigrationInterface {
  name = 'SeedDb1676820025653';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('reactjs'), ('java'), ('js'), ('nodejs'), ('next')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // on purpose
  }
}
