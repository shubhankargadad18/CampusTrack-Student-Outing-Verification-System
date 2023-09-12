import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
} from "typeorm";
import { UserEntity } from "./Auth";

@Entity()
@Index(["booking_id", "booking_type", "scan_type"], { unique: true })
export class Outing {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @Index()
  booking_id!: string;

  @Column()
  booking_type!: string;

  @Column()
  scan_type!: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  scanned_by!: UserEntity;

  @Column()
  scan_time!: Date;

  @Column({ default: false })
  revoked!: boolean;

  @ManyToOne(() => UserEntity, { nullable: true })
  revoked_by!: UserEntity;

  @Column({ nullable: true })
  revoked_time!: Date;
}
