"use client";

import BagIcon from "../icons/BagIcon";
import BillIcon from "../icons/BillIcon";
import CardIcon from "../icons/CardIcon";
import CoinIcon from "../icons/CoinIcon";
import IconWrapper from "../icons/IconWrapper";

export default function FloatingIcons() {
  return (
    <div className="relative">
      <IconWrapper className="absolute top-0 left-[10%]">
        <BillIcon className="size-10" />
      </IconWrapper>
      <IconWrapper className="absolute top-20 left-[20%] ">
        <CoinIcon className="size-10" />
      </IconWrapper>
      <IconWrapper className="absolute top-17 left-[60%] ">
        <CardIcon className="size-10" />
      </IconWrapper>

      <IconWrapper className="absolute top-50 left-[50%] ">
        <BagIcon className="size-10" />
      </IconWrapper>
    </div>
  );
}
