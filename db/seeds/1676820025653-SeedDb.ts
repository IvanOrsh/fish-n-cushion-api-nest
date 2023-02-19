import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1676820025653 implements MigrationInterface {
  name = 'SeedDb1676820025653';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('reactjs'), ('java'), ('js'), ('nodejs'), ('next')`,
    );

    await queryRunner.query(
      // password is testingStuffs
      `INSERT INTO users (username, email, password) VALUES ('TestingUser', 'qwerty@gmail.com', '$2b$10$UzW1Z3M/ZvOBb9RVm2rKM.2XGppLihR2S94bxof/CqgrUPy9W3v/u')`,
    );

    await queryRunner.query(
      // password is testingStuffs
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'First article description', 'First article body', 'js,reactjs', 1), ('second-article', 'Second article', 'Second article description', 'Second article body', 'js,next', 1)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // on purpose
  }
}
