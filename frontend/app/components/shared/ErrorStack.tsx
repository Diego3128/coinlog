"use client";

import { useEffect, useState } from "react";

interface Props {
  errors: string[];
}

export default function ErrorStack({ errors }: Props) {
  const [errorMessages, setErrorMessages] = useState(errors);

  useEffect(() => {
    setErrorMessages(errors);
  }, [errors]);

  if (errorMessages.length === 0) return null;

  const dropErrorMessage = (msg: String) => {
    setErrorMessages((prevMsgs) => prevMsgs.filter((m) => m !== msg));
  };

  return (
    <ul className="relative p-3 py-6">
      {errorMessages.map((error, i) => (
        <li
          style={{
            transform: `translateY(${i * 3 + 5}px)`,
            animationDelay: `${150 * i}ms`,
            animationFillMode: "backwards",
          }}
          key={`${error}-${i}`}
          className={`absolute left-0 top-0 w-full animate-fadeIn`}
        >
          <div
            style={{ width: `${100 - i * 0.7}%` }}
            className="relative mx-auto bg-red-300 text-white rounded-lg border border-red-500 p-1 capitalize pr-3"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={(e) => dropErrorMessage(error)}
              className="rounded-full cursor-pointer  bg-red-500 text-white text-center absolute top-1 right-2 size-5 text-xs font-bold"
            >
              X
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
