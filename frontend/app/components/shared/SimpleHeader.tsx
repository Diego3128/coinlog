"use client";

import CoinIcon from "../icons/CoinIcon";

export default function SimpleHeader() {
  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold text-primary">CoinLog</h1>
      <CoinIcon className="size-6 text-primary" />
    </div>
  );
}
