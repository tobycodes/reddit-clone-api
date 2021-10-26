import { MigrationInterface, QueryRunner } from "typeorm";

export class addSlugToPosts1633864809194 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`alter table post
            add column slug text null;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`alter table post
            drop column slug;
        `);
  }
}
