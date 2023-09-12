export enum ScanType {
  EXIT = "EXIT",
  RETURN = "RETURN",
}

export enum BookingType {
  WEEKEND_LEAVE = "WEEKEND_LEAVE",
  GENERAL_LEAVE = "GENERAL_LEAVE",
}

export interface WeekendLeaveDetails {
  regNo: string;
  name: string;
  gender: string;
  hostelBlockNo: string;
  hostelRoomNo: string;
  placeOfVisit: string;
  purposeOfVisit: string;
  outingDate: Date;
  time: string;
  parentContactNumber: string;
}
