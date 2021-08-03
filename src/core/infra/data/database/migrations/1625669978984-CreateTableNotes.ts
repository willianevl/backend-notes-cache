import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateTableNotes1625669978984 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "notes",
                columns: [
                    {
                        name: "uid",
                        type: "varchar",
                        length: "36",
                        isNullable: false,
                        isPrimary: true
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "60",
                        isNullable: false
                    },
                    {
                        name: "description",
                        type: "varchar",
                        length: "100",
                        isNullable: false
                    },
                    {
                        name: "user_uid",
                        type: "varchar",
                        length: "36",
                        isNullable: false,
                    },
                    { name: "created_at", type: "timestamp", isNullable: false },
                    { name: "updated_at", type: "timestamp", isNullable: false },
                ]
            })
        );


        await queryRunner.createForeignKey(
            "notes",
            new TableForeignKey({
                columnNames: ["user_uid"],
                referencedColumnNames: ["uid"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("notes");
    }

}
