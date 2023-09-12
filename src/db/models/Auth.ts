import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar2", nullable: true })
  name!: string | null;

  @Column({ type: "varchar2", nullable: true, unique: true })
  email!: string | null;

  @Column({ type: "date", nullable: true })
  emailVerified!: Date | null;

  @Column({ type: "varchar2", nullable: true })
  image!: string | null;

  @OneToMany(() => SessionEntity, (session) => session.userId)
  sessions!: SessionEntity[];

  @OneToMany(() => AccountEntity, (account) => account.userId)
  accounts!: AccountEntity[];
}

@Entity({ name: "accounts" })
export class AccountEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column()
  type!: string;

  @Column()
  provider!: string;

  @Column()
  providerAccountId!: string;

  @Column({ type: "varchar2", nullable: true })
  refresh_token!: string | null;

  @Column({ type: "varchar2", nullable: true })
  access_token!: string | null;

  @Column({
    type: "number",
    nullable: true,
  })
  expires_at!: number | null;

  @Column({ type: "varchar2", nullable: true })
  token_type!: string | null;

  @Column({ type: "varchar2", nullable: true })
  scope!: string | null;

  @Column({ type: "varchar2", nullable: true, length: 2000 })
  id_token!: string | null;

  @Column({ type: "varchar2", nullable: true })
  session_state!: string | null;

  @ManyToOne(() => UserEntity, (user) => user.accounts, {
    createForeignKeyConstraints: true,
  })
  user!: UserEntity;
}

@Entity({ name: "sessions" })
export class SessionEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  sessionToken!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column()
  expires!: Date;

  @ManyToOne(() => UserEntity, (user) => user.sessions)
  user!: UserEntity;
}

@Entity({ name: "verification_tokens" })
export class VerificationTokenEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  token!: string;

  @Column()
  identifier!: string;

  @Column()
  expires!: Date;
}
