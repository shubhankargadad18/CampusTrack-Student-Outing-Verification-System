import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "WEEKEND_LEAVE_BOOKING" })
export class WeekendLeaveBooking {
  @Column({ length: 9 })
  reg_no!: string;

  @Column()
  name!: string;

  @Column()
  hostel_block_no!: string;

  @Column()
  hostel_room_no!: string;

  @Column()
  gender!: string;

  @Column()
  place_of_visit!: string;

  @Column()
  purpose_of_visit!: string;

  @Column("timestamp")
  log_timestamp!: Date;

  @Column()
  time!: string;

  @Column()
  contact_number!: string;

  @Column({ nullable: true })
  friend_contact_number?: string;

  @PrimaryColumn()
  booking_id!: string;

  @Column()
  parent_contact_number!: string;

  @Column("date")
  outing_date!: Date;

  @Column()
  application_no!: number;

  @Column()
  outing_eligibility_status!: boolean;

  @Column()
  booking_status!: number;

  @Column({ nullable: true })
  warden_remarks?: string;
}
