import { type NextPage } from "next";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { BookingType, ScanType } from "../types";
import type { WeekendLeaveDetails } from "../types";

import FemalePlaceholder from "~/outing/assets/female_placeholder.png";
import MalePlaceholder from "~/outing/assets/male_placeholder.png";
import Exit from "~/outing/assets/exit.png";
import Return from "~/outing/assets/entry.png";
import PenguinSad from "~/outing/assets/penguin.png";
import QrCodeScan from "~/outing/assets/qr-code-scan.png";
import Image from "next/image";

import { api } from "~/outing/utils/api";
import type { Outing } from "../db/models";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Hostel Outing</title>
        <meta
          name="description"
          content="Website to verify hostel outing passes @ VIT-AP"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {sessionData ? (
          <>
            <div className="flex min-h-screen flex-col items-center justify-center">
              <Scanner />
            </div>
            <div className="mx-auto w-5/6">
              <PrevScans />
            </div>
          </>
        ) : (
          <div className="flex min-h-screen flex-col items-center justify-center">
            <SignIn />
          </div>
        )}
      </main>
    </>
  );
};

export default Home;

export const SignIn: React.FC = () => {
  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
      <h1 className="tracking-tigh text-4xl font-bold sm:text-[5rem]">
        Please Sign In
      </h1>
      <button
        className="rounded-full bg-gray-600 px-10  py-3 font-semibold text-white no-underline transition"
        onClick={() => void signIn("google")}
      >
        Sign in
      </button>
    </div>
  );
};

export const Scanner: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const recordScan = api.outing.recordScan.useMutation();

  const [inputText, setInputText] = useState("");
  const [scanType, setScanType] = useState(ScanType.EXIT);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <>
      <div className="mb-4 flex w-full flex-row justify-center gap-3">
        <input
          type="text"
          value={inputText}
          className=" w-3/5 rounded-md border border-black p-2"
          ref={inputRef}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") {
              return;
            }

            if (!inputText) {
              return;
            }
            recordScan.mutate({
              bookingId: inputText,
              scanType,
              bookingType: BookingType.WEEKEND_LEAVE, // TODO: Get this from inputText
            });
            setInputText("");
          }}
        />
        <select
          className="w-24 rounded-md border border-black bg-white p-2"
          name="scan_type"
          id="scan_type"
          value={scanType}
          onChange={(e) => {
            setScanType(e.target.value as ScanType);
          }}
        >
          <option value={ScanType.EXIT}>Exit</option>
          <option value={ScanType.RETURN}>Return</option>
        </select>
      </div>
      <ScanResult
        scanData={recordScan.data}
        status={recordScan.status}
        errorMessage={recordScan.error?.message}
      />
    </>
  );
};

export const ScanResult: React.FC<{
  scanData?: {
    outing: Outing;
    student: WeekendLeaveDetails;
  };
  status: string;
  errorMessage?: string;
}> = ({ scanData, status, errorMessage }) => {
  const detailsMap = {
    "Student Name": scanData?.student.name,
    "Registration Number": scanData?.student.regNo,
    Gender: scanData?.student.gender,
    "Hostel Block": scanData?.student.hostelBlockNo,
    "Hostel Room Number": scanData?.student.hostelRoomNo,
    "Place of Visit": scanData?.student.placeOfVisit,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    "Outing Date": new Date(scanData?.student.outingDate!).toDateString(),
    "Outing Time": scanData?.student.time,
    "Parent Contact Number": scanData?.student.parentContactNumber,
  };

  return (
    <>
      {status !== "idle" && status !== "loading" ? (
        <div
          className={`mx-auto mt-5 w-5/6 rounded-md p-2 text-center shadow-lg ${
            status === "success" ? "bg-green-400" : "bg-red-400"
          }`}
        >
          <p>
            <span className="capitalize">{status}</span>
          </p>
        </div>
      ) : null}
      <div
        className="mx-auto mt-3 flex w-5/6 flex-row flex-wrap-reverse rounded-md border shadow-lg"
        style={{
          minHeight: "60vh",
        }}
      >
        {!scanData ? (
          <div className="w-full self-center text-center">
            {status === "loading" ? (
              "Loading..."
            ) : status === "error" ? (
              <>
                <Image
                  src={PenguinSad}
                  alt="sad_penguin_image"
                  className="mx-auto mb-10 w-2/12"
                />
                <p className="text-2xl font-light opacity-50">{errorMessage}</p>
              </>
            ) : (
              <>
                <Image
                  src={QrCodeScan}
                  alt="qrcode_scanner_image"
                  className="mx-auto mb-10 w-2/12"
                />
                <p className="text-2xl font-light opacity-50">
                  Please scan a valid hostel pass
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex w-4/5 flex-col flex-wrap justify-start gap-4 border-r p-4 max-xl:w-1/2 max-sm:w-full">
              <div className="flex flex-col flex-wrap gap-1">
                <p className="text-xl font-medium">
                  {scanData.outing.booking_type === BookingType.WEEKEND_LEAVE
                    ? "Weekend Leave"
                    : "General Leave"}{" "}
                </p>
                <p className="text-sm font-light">
                  Leave ID: {scanData.outing.booking_id}
                </p>
              </div>

              <div className="flex w-full flex-row flex-wrap justify-start gap-10 max-sm:gap-2">
                {Object.entries(detailsMap).map(([key, value], ind) => (
                  <div
                    className="flex w-1/5 flex-grow flex-col gap-1 border-b capitalize last:border-b-0 max-lg:w-1/4 max-md:w-1/2 max-sm:w-full"
                    key={ind}
                  >
                    <p className="text-md font-medium">{key}</p>
                    <p className="text-lg font-light">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex w-1/5 flex-col max-xl:w-1/2 max-sm:w-full">
              <div className="h-1/2">
                <Image
                  src={
                    scanData.outing.scan_type === ScanType.EXIT ? Exit : Return
                  }
                  alt="checkmark"
                  className="h-full w-full"
                />
              </div>
              <div className="h-1/2">
                <Image
                  src={
                    scanData.student.gender === "male"
                      ? MalePlaceholder
                      : FemalePlaceholder
                  }
                  alt="student_image"
                  className="h-full w-full"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export const PrevScans: React.FC = () => {
  const scansQuery = api.outing.getScans.useQuery({});

  return scansQuery.data ? (
    <div className="flex flex-col gap-5">
      <h1 className="text-center text-3xl font-semibold">Recent Scans</h1>
      <div className="flex flex-col gap-2 rounded-md border shadow-lg">
        {scansQuery.data.scans.map((scan, ind) => (
          <div
            className="flex flex-row flex-wrap items-center gap-5 border-b p-2"
            key={ind}
          >
            <Image
              src={scan.scan_type === ScanType.EXIT ? Exit : Return}
              alt="exit_entry_icon"
              width={48}
            />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium">Booking ID</p>
              <p className="text-sm font-light">{scan.booking_id}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium">Scanned At</p>
              <p className="text-sm font-light">
                {new Date(scan.scan_time).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <button className="ml-auto mr-2 rounded-md bg-blue-400 p-2 text-white">
              Details
            </button>
          </div>
        ))}
      </div>
    </div>
  ) : null;
};
