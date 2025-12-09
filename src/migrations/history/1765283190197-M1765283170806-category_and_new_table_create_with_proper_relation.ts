import { MigrationInterface, QueryRunner } from "typeorm";

export class M1765283170806CategoryAndNewTableCreateWithProperRelation1765283190197 implements MigrationInterface {
    name = 'M1765283170806CategoryAndNewTableCreateWithProperRelation1765283190197'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` varchar(36) NOT NULL, \`category_name\` varchar(100) NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_9359e3b1d5e90d7a0fbe3b2807\` (\`category_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`news\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(200) NOT NULL, \`description\` text NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`category_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`news\` ADD CONSTRAINT \`FK_aac53a9364896452e463139e4a0\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`news\` DROP FOREIGN KEY \`FK_aac53a9364896452e463139e4a0\``);
        await queryRunner.query(`DROP TABLE \`news\``);
        await queryRunner.query(`DROP INDEX \`IDX_9359e3b1d5e90d7a0fbe3b2807\` ON \`category\``);
        await queryRunner.query(`DROP TABLE \`category\``);
    }

}
