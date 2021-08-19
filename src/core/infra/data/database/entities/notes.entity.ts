import {BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import { v4 as uuid } from 'uuid';
import { UserEntity } from "./users.entity";

@Entity({name: "notes"})
export class NotesEntity extends BaseEntity {
    @PrimaryColumn({name: "uid"})
    uid!: string;

    @Column({name: "title"})
    title: string;

    @Column({name: "description"})
    description: string;

    @Column({name: "user_uid"})
    userUid: string;

    @Column({ name: "created_at" })
    createdAt!: Date;
  
    @Column({ name: "updated_at" })
    updatedAt!: Date;

    @ManyToOne(() => UserEntity, user => user.notes)
    @JoinColumn({name: 'user_uid', referencedColumnName: 'uid'})
    user?: UserEntity;

    constructor(title: string, description: string, userUid: string){
        super();
        this.userUid = userUid;
        this.title = title;
        this.description = description;
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
