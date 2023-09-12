import { z } from "zod";
import { faker } from "@faker-js/faker";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Outing, AuthEntities, WeekendLeaveBooking } from "~/outing/db/models";
import { TRPCError } from "@trpc/server";
import type { EntityManager } from "typeorm";
import { ScanType, BookingType } from "~/outing/types";
import type { WeekendLeaveDetails } from "~/outing/types";

const checkOutingPassValidty = async (
  manager: EntityManager,
  bookingId: string,
  bookingType: BookingType
): Promise<WeekendLeaveBooking | null> => {
  if (bookingType === BookingType.WEEKEND_LEAVE) {
    const weekendLeaveBooking = await manager.findOne(WeekendLeaveBooking, {
      where: {
        booking_id: bookingId,
      },
    });

    if (!weekendLeaveBooking) {
      return null;
    }

    return weekendLeaveBooking;
  } else {
    // TODO: Implement general leave
    return null;
  }
};

const checkOutingScanValidity = async (
  manager: EntityManager,
  bookingId: string,
  bookingType: BookingType,
  scanType: ScanType
): Promise<{ valid: boolean; message: string }> => {
  const prevScans = await manager.find(Outing, {
    where: {
      booking_id: bookingId,
      booking_type: bookingType,
    },
  });

  if (scanType === ScanType.RETURN) {
    if (!prevScans.find((scan) => scan.scan_type === ScanType.EXIT)) {
      return {
        valid: false,
        message: "The hostel pass is not scanned for exit.",
      }; // No previous exit
    }

    if (prevScans.find((scan) => scan.scan_type === ScanType.RETURN)) {
      return {
        valid: false,
        message: "The hostel pass is already scanned for return.",
      }; // Already returned
    }
  } else {
    if (prevScans.length !== 0) {
      return {
        valid: false,
        message: "The hostel pass is already scanned for exit.",
      };
    }
  }

  return {
    valid: true,
    message: "",
  };
};

export const outingRouter = createTRPCRouter({
  recordScan: protectedProcedure
    .input(
      z.object({
        bookingId: z
          .string({
            required_error: "Booking ID is required",
          })
          .nonempty("Booking ID is required"),
        bookingType: z.nativeEnum(BookingType, {
          required_error: "Booking type is required",
        }),
        scanType: z.nativeEnum(ScanType, {
          required_error: "Scan type is required",
        }),
      })
    )
    .mutation(
      async ({
        input,
        ctx,
      }): Promise<{ outing: Outing; student: WeekendLeaveDetails }> => {
        const { bookingId, bookingType, scanType } = input;
        const { session, getManager } = ctx;

        const manager = await getManager();

        // Check if outing is valid
        const outingValid = await checkOutingPassValidty(
          manager,
          bookingId,
          bookingType
        );

        if (!outingValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The hostel pass is invalid.",
          });
        }

        // Check if outing is already scanned
        const scanValid = await checkOutingScanValidity(
          manager,
          bookingId,
          bookingType,
          scanType
        );

        if (!scanValid.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: scanValid.message,
          });
        }

        if (
          new Date(outingValid.outing_date).toDateString() !==
          new Date().toDateString()
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The hostel pass is not valid for today.",
          });
        }

        const outing = new Outing();
        outing.booking_id = bookingId;
        outing.booking_type = bookingType;
        outing.scan_type = scanType;

        const user = new AuthEntities.UserEntity();
        user.id = session.user.id;

        outing.scanned_by = user;
        outing.scan_time = new Date();

        await manager.save(outing);

        return {
          outing,
          student: {
            regNo: outingValid.reg_no,
            name: outingValid.name,
            gender: outingValid.gender,
            hostelBlockNo: outingValid.hostel_block_no,
            hostelRoomNo: outingValid.hostel_room_no,
            placeOfVisit: outingValid.place_of_visit,
            purposeOfVisit: outingValid.purpose_of_visit,
            outingDate: outingValid.outing_date,
            time: outingValid.time,
            parentContactNumber: outingValid.parent_contact_number,
          },
        };
      }
    ),

  getBookingDetails: protectedProcedure
    .input(
      z.object({
        bookingId: z
          .string({
            required_error: "Booking ID is required",
          })
          .nonempty("Booking ID is required"),
        bookingType: z.nativeEnum(BookingType, {
          required_error: "Booking type is required",
        }),
      })
    )
    .query(
      async ({ input, ctx }): Promise<{ student: WeekendLeaveDetails }> => {
        const { bookingId, bookingType } = input;
        const { getManager } = ctx;

        const manager = await getManager();

        const booking = await checkOutingPassValidty(
          manager,
          bookingId,
          bookingType
        );

        if (!booking) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The hostel pass is invalid.",
          });
        }

        return {
          student: {
            regNo: booking.reg_no,
            name: booking.name,
            gender: booking.gender,
            hostelBlockNo: booking.hostel_block_no,
            hostelRoomNo: booking.hostel_room_no,
            placeOfVisit: booking.place_of_visit,
            purposeOfVisit: booking.purpose_of_visit,
            outingDate: booking.outing_date,
            time: booking.time,
            parentContactNumber: booking.parent_contact_number,
          },
        };
      }
    ),

  getScans: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(
      async ({ input, ctx }): Promise<{ scans: Outing[]; count: number }> => {
        const { page, limit } = input;
        const { getManager } = ctx;

        const manager = await getManager();

        const [scans, count] = await manager.findAndCount(Outing, {
          skip: (page - 1) * limit,
          take: limit,
          order: {
            scan_time: "DESC",
          },
        });

        return {
          scans,
          count,
        };
      }
    ),

  seedWeekendLeave: protectedProcedure
    .input(
      z.object({
        count: z.number().default(100),
      })
    )
    .mutation(async ({ input, ctx }): Promise<{ success: boolean }> => {
      const { getManager } = ctx;
      const { count } = input;
      const manager = await getManager();

      const weekendLeaveBookings: WeekendLeaveBooking[] = [];

      for (let i = 0; i < count; i++) {
        const weekendLeaveBooking = new WeekendLeaveBooking();
        weekendLeaveBooking.reg_no = `20BCE${faker.random.numeric(4)}`;
        weekendLeaveBooking.name = faker.name.fullName();
        weekendLeaveBooking.hostel_block_no = "MH-1";
        weekendLeaveBooking.hostel_room_no = faker.address.buildingNumber();
        weekendLeaveBooking.gender = faker.name.gender(true);
        weekendLeaveBooking.place_of_visit = faker.address.city();
        weekendLeaveBooking.purpose_of_visit = faker.lorem.sentence();
        weekendLeaveBooking.log_timestamp = new Date();
        weekendLeaveBooking.time = "10:00 AM - 12:00 PM";
        weekendLeaveBooking.contact_number =
          faker.phone.number("+91 ##########");
        weekendLeaveBooking.friend_contact_number =
          faker.phone.number("+91 ##########");
        weekendLeaveBooking.booking_id = `2023WL000${faker.helpers.unique(() =>
          faker.random.numeric(4)
        )}`;
        weekendLeaveBooking.parent_contact_number =
          faker.phone.number("+91 ##########");
        weekendLeaveBooking.outing_date = new Date("2023-05-02");
        weekendLeaveBooking.application_no = parseInt(
          `20200${faker.random.numeric(5)}`
        );
        weekendLeaveBooking.outing_eligibility_status =
          faker.datatype.boolean();
        weekendLeaveBooking.booking_status = faker.datatype.number({
          min: 0,
          max: 2,
        });

        weekendLeaveBookings.push(weekendLeaveBooking);
      }

      await manager.save(weekendLeaveBookings);

      return {
        success: true,
      };
    }),
});
