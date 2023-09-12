import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "HOSTEL_LEAVE_APPLICATION" })
export class HostelLeaveApplication {
  @PrimaryColumn()
  leave_id!: string;

  @Column()
  application_no!: number;

  @Column()
  regno!: string;

  @Column()
  visiting_place!: string;

  @Column()
  reason!: string;

  @Column()
  leave_code!: string;

  @Column()
  status_master_sttatus_id!: number;

  @Column()
  applied_to!: string;

  @Column()
  leave_from_date!: Date;

  @Column()
  leave_to_date!: Date;

  @Column()
  from_time!: string;

  @Column()
  to_time!: string;

  @Column()
  leave_applied_date!: Date;

  @Column()
  remarks!: string;

  @Column()
  leave_finalized_date!: Date;

  @Column()
  leave_approved_by!: string;

  @Column()
  leave_rejected_by!: string;

  @Column()
  leave_cancelled_by!: string;

  @Column()
  log_userid!: string;

  @Column()
  log_timestamp!: Date;

  @Column()
  log_ipaddress!: string;

  @Column()
  gate_in!: string;

  @Column()
  gate_out!: string;

  @Column()
  leave_flag!: string;

  @Column()
  log_role!: string;

  @Column()
  parent_consent!: boolean;

  @Column()
  parent_timestamp!: Date;

  @Column()
  leave_extended_date!: Date;

  @Column()
  leave_extension_approver!: string;

  @Column()
  leave_cancelled_date!: Date;
}
