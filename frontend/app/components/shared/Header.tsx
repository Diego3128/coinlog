"use client";

import CoinIcon from "../icons/CoinIcon";

export default function Header() {
  return (
    <div className="group hover:border-primary transition-colors duration-500 text-center mb-4 border border-gray-200 w-fit mx-auto p-2 relative z-10 bg-white rounded-xl">
      <div className="flex justify-between  items-center">
        <h1 className="text-3xl font-bold text-primary">CoinLog</h1>
        <CoinIcon className="size-10 group-hover:scale-105 transition-transform duration-500"/>
      </div>
      <p className="text-sm text-base-content/70 mt-2">
        Take control of your personal finances
      </p>
    </div>
  );
}
