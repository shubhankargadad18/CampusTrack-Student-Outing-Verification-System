import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import HostelLogo from "~/outing/assets/hostel_logo.png";
import DefaultPfp from "~/outing/assets/default_pfp.png";

export const AppBar = () => {
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <header
        aria-label="Site Header"
        className="w-full border-b border-gray-100 bg-white text-black"
      >
        <div className="mx-auto flex h-16 items-center justify-between sm:px-6 lg:px-8">
          <div className="ml-5 flex items-center gap-4 lg:ml-0">
            <Link href="/" className="flex">
              <span className="sr-only">Logo</span>
              <span className="inline-block w-40 rounded-lg">
                <Image src={HostelLogo} alt="Logo" />
              </span>
            </Link>
          </div>

          <div className="flex flex-1  justify-end gap-8">
            <div className="items flex">
              <div className="flex items-center  border-gray-100">
                <span>
                  {session ? (
                    <div className="relative inline-block text-left">
                      <div>
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          id="options-menu"
                          aria-haspopup="true"
                          aria-expanded="true"
                          onClick={() => setIsOpen(!isOpen)}
                        >
                          <Image
                            src={session.user.image || DefaultPfp}
                            alt="user"
                            width={50}
                            height={50}
                            className="h-10 w-10 rounded-full"
                          />
                        </button>
                      </div>
                      <div className={isOpen ? "block" : "hidden"}>
                        <div
                          className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="options-menu"
                        >
                          <div className="py-1" role="none">
                            <p
                              className="block w-full px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              role="menuitem"
                            >
                              Hi {session.user.name}
                            </p>
                            <button
                              onClick={() => void signOut()}
                              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              role="menuitem"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="flex items-center border-b-4 border-transparent p-4"
                      onClick={() => void signIn("google")}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20ZM12 6C9.794 6 8 7.794 8 10C8 12.206 9.794 14 12 14C14.206 14 16 12.206 16 10C16 7.794 14.206 6 12 6ZM12 12C10.346 12 9 10.654 9 9C9 7.346 10.346 6 12 6C13.654 6 15 7.346 15 9C15 10.654 13.654 12 12 12Z"
                          fill="black"
                        />
                      </svg>

                      <span className="ml-2"> Sign In </span>
                    </button>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
