import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTableUser1625528808365 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "uid",
                        type: "varchar",
                        length: "36",
                        isNullable: false,
                        isPrimary: true
                    },
                    {
                        name: "username",
                        type: "varchar",
                        length: "50",
                        isNullable: false
                    },
                    {
                        name: "password",
                        type: "varchar",
                        length: "150",
                        isNullable: false
                    },
                    { name: "created_at", type: "timestamp", isNullable: false },
                    { name: "updated_at", type: "timestamp", isNullable: false },
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
    }

}
