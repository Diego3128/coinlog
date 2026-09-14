"use client";

import { logOutAction } from "@/app/actions/auth/log-out.action";
import { UserType } from "@/src/schemas/auth/UserSchema";
import Link from "next/link";

interface Props {
    user: UserType;
}
export default function PanelOptions({user}: Props) {

    const userName = user.username.length > 9 ? `${user.username.slice(0, 9)}...` : user.username;

    const onLogout = async ()=> {
        await logOutAction();
    };

  return (
    <ul className="menu menu-horizontal bg-base-200 rounded-box">
      <li>
        <details >
          <summary className="min-w-28 max-w-28 lg:max-w-40 flex justify-between">
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <g id="Menu / More_Grid_Big">
                  {" "}
                  <g id="Vector">
                    {" "}
                    <path
                      d="M17 18C17 18.5523 17.4477 19 18 19C18.5523 19 19 18.5523 19 18C19 17.4477 18.5523 17 18 17C17.4477 17 17 17.4477 17 18Z"
                      stroke="#919191"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M11 18C11 18.5523 11.4477 19 12 19C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18Z"
                      stroke="#919191"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M5 18C5 18.5523 5.44772 19 6 19C6.55228 19 7 18.5523 7 18C7 17.4477 6.55228 17 6 17C5.44772 17 5 17.4477 5 18Z"
                      stroke="#919191"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z"
                      stroke="#919191"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z"
                      stroke="#919191"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z"
                      stroke="#919191"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5C17.4477 5 17 5.44772 17 6Z"
                      stroke="#919191"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M11 6C11 6.55228 11.4477 7 12 7C12.5523 7 13 6.55228 13 6C13 5.44772 12.5523 5 12 5C11.4477 5 11 5.44772 11 6Z"
                      stroke="#919191"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M5 6C5 6.55228 5.44772 7 6 7C6.55228 7 7 6.55228 7 6C7 5.44772 6.55228 5 6 5C5.44772 5 5 5.44772 5 6Z"
                      stroke="#919191"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                  </g>{" "}
                </g>{" "}
              </g>
            </svg>
            <span className="font-bold text-base-content/70">{userName}</span>
          </summary>
          <ul className="space-y-2">
            <li>
              <Link href={"#"}>Profile</Link>
            </li>

            <li>
              <details >
                <summary>Budgets</summary>
                <ul>
                  <li>
                    <Link href={"#"}>New</Link>
                  </li>
                  <li>
                    <Link href={"#"}>List</Link>
                  </li>
                </ul>
              </details>
            </li>

            <li>
              <details >
                <summary>Expenses</summary>
                <ul>
                  <li>
                    <Link href={"#"}>New</Link>
                  </li>
                  <li>
                    <Link href={"#"}>List</Link>
                  </li>
                </ul>
              </details>
            </li>

            <li>
              <button onClick={onLogout} className="bg-warning">Log out</button>
            </li>

          </ul>
        </details>
      </li>
    </ul>
  );
}
