/* eslint-disable @next/next/no-img-element */
"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { icons } from "lucide-react";
import { BigButton } from "@/src/components/BigButton";

/* eslint-disable react/jsx-key */
const TABS: [ReactNode, string, keyof typeof icons, string][] = [
  ["Sign", "/connected/Sign", "Signature", "text-orange-500"],
  ["Transfer", "/connected/Transfer", "ArrowLeftRight", "text-lime-500"],
  [
    "Transfer with Lumos",
    "/connected/TransferLumos",
    "LampWallDown",
    "text-yellow-500",
  ],
  [
    "Time Locked Transfer",
    "/connected/TimeLockedTransfer",
    "Clock",
    "text-amber-500",
  ],
  ["Transfer xUDT", "/connected/TransferXUdt", "BadgeCent", "text-emerald-500"],
  ["Issue xUDT (SUS)", "/connected/IssueXUdtSus", "Rss", "text-sky-500"],
  [
    <div className="flex flex-col">
      Issue xUDT <span className="whitespace-nowrap">(Type ID)</span>
    </div>,
    "/connected/IssueXUdtTypeId",
    "PencilRuler",
    "text-blue-500",
  ],
  ["Nervos DAO", "/connected/NervosDao", "Vault", "text-pink-500"],
  ["Hash", "/utils/Hash", "Barcode", "text-violet-500"],
  ["Mnemonic", "/utils/Mnemonic", "SquareAsterisk", "text-fuchsia-500"],
  ["Keystore", "/utils/Keystore", "Notebook", "text-rose-500"],
  ["Create Cluster", "/connected/CreateCluster", "Wheat", "text-emerald-500"],
  ["Create Spore", "/connected/CreateSpore", "Cherry", "text-pink-500"],
  ["Transfer Spore", "/connected/TransferSpore", "BadgeCent", "text-fuchsia-500"],
  ["Melt Spore", "/connected/MeltSpore", "BadgeCent", "text-fuchsia-500"],

];
/* eslint-enable react/jsx-key */

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    TABS.forEach(([_, path]) => router.prefetch(path));
  }, [router]);

  return (
    <div className="flex flex-wrap justify-center gap-8 px-4 lg:px-16">
      {TABS.map(([name, link, iconName, classes]) => (
        <BigButton
          key={link}
          size="sm"
          iconName={iconName}
          onClick={() => router.push(link)}
          className={classes}
        >
          {name}
        </BigButton>
      ))}
    </div>
  );
}
