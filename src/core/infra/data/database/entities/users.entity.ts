import {BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryColumn} from "typeorm";
import { v4 as uuid } from 'uuid';
import { CheckedNotesEntity } from "./checked-notes.entity";
import { NotesEntity } from "./notes.entity";

@Entity({name: "users"})
export class UserEntity extends BaseEntity {
    @PrimaryColumn({name: "uid"})
    uid!: string;

    @Column({name: "username"})
    username: string;

    @Column({name: "password"})
    password: string;

    @Column({ name: "created_at" })
    createdAt!: Date;
  
    @Column({ name: "updated_at" })
    updatedAt!: Date;

    @OneToMany(() => NotesEntity, notes => notes.user)
    notes?: NotesEntity[];

    @OneToMany(() => CheckedNotesEntity, checkednotes => checkednotes.user)
    checkedNotes?: CheckedNotesEntity[];

    constructor(username: string, password: string, confirmPassword: string){
        super();
        this.username = username;
        this.password = password;
        confirmPassword;
    }

    @BeforeInsert()
    private beforeInsert() {
      this.uid = uuid();
      this.createdAt = new Date(Date.now());
      this.updatedAt = new Date(Date.now());
    }
  
    @BeforeUpdate()
    private beforeUpdate() {
      this.updatedAt = new Date(Date.now());
    }
}
