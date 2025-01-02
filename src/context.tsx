"use client";

import React, { createContext, ReactNode, useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { Notifications } from "./components/Notifications";
import { formatString, useGetExplorerLink } from "./utils";
import { Key } from "lucide-react";

function WalletIcon({
  wallet,
  className,
}: {
  wallet: ccc.Wallet;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={wallet.icon}
      alt={wallet.name}
      className={`rounded-full ${className}`}
      style={{ width: "1rem", height: "1rem" }}
    />
  );
}

export const APP_CONTEXT = createContext<
  | {
      enabledAnimate: boolean;
      backgroundLifted: boolean;
      setAnimate: (v: boolean) => void;
      setBackgroundLifted: (v: boolean) => void;

      signer?: ccc.Signer;
      setPrivateKeySigner: (
        signer: ccc.SignerCkbPrivateKey | undefined,
      ) => void;
      openSigner: () => void;
      disconnect: () => void;
      openAction: ReactNode;

      sendMessage: (
        level: "error" | "info",
        title: string,
        msgs: ReactNode[],
      ) => void;
      createSender: (title: string) => {
        log: (...msgs: ReactNode[]) => void;
        error: (...msgs: ReactNode[]) => void;
      };
    }
  | undefined
>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [privateKeySigner, setPrivateKeySigner] = useState<
    ccc.SignerCkbPrivateKey | undefined
  >(undefined);
  const [address, setAddress] = useState<string>("");

  const [enabledAnimate, setAnimate] = useState(true);
  const [backgroundLifted, setBackgroundLifted] = useState(false);

  const {
    wallet,
    signerInfo: cccSigner,
    open,
    client,
    disconnect,
  } = ccc.useCcc();
  const signer = privateKeySigner ?? cccSigner?.signer;

  const { explorerAddress } = useGetExplorerLink();

  useEffect(() => {
    if (
      !privateKeySigner ||
      privateKeySigner.client.addressPrefix === client.addressPrefix
    ) {
      return;
    }

    setPrivateKeySigner(
      new ccc.SignerCkbPrivateKey(client, privateKeySigner.privateKey),
    );
  }, [privateKeySigner, client]);

  useEffect(() => {
    signer?.getInternalAddress().then((a) => setAddress(a));
  }, [signer]);

  const [messages, setMessages] = useState<
    ["error" | "info", string, ReactNode][]
  >([]);

  const sendMessage = (
    level: "error" | "info",
    title: string,
    msgs: ReactNode[],
  ) =>
    setMessages((messages) => [
      [
        level,
        title,
        msgs.map((msg, i) => (
          <React.Fragment key={i}>
            {i === 0 ? "" : " "}
            {msg}
          </React.Fragment>
        )),
      ],
      ...messages,
    ]);

  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg = (() => {
        if (typeof event.reason === "object" && event.reason !== null) {
          const { name, message, stack, cause } = (event as any).reason;
          return JSON.stringify({ name, message, stack, cause });
        }
        if (typeof event.reason === "string") {
          return event.reason;
        }
        return JSON.stringify(event);
      })();
      sendMessage("error", "Unknown error", [msg]);
    };

    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, [setMessages]);

  return (
    <APP_CONTEXT.Provider
      value={{
        enabledAnimate,
        backgroundLifted,
        setAnimate,
        setBackgroundLifted,

        signer,
        setPrivateKeySigner,
        openSigner: () => {
          if (cccSigner) {
            open();
          } else {
            sendMessage("info", "Address Copied", [explorerAddress(address)]);
            window.navigator.clipboard.writeText(address);
          }
        },
        disconnect: () => {
          if (cccSigner) {
            disconnect();
          } else {
            setPrivateKeySigner(undefined);
          }
        },
        openAction: cccSigner ? (
          <>
            {wallet && <WalletIcon wallet={wallet} className="mr-2" />}
            {formatString(address, 5, 4)}
          </>
        ) : (
          <>
            <Key className="mr-2" style={{ width: "1rem", height: "1rem" }} />
            {formatString(address, 5, 4)}
          </>
        ),

        sendMessage,
        createSender: (title) => ({
          log: (...msgs) => sendMessage("info", title, msgs),
          error: (...msgs) => sendMessage("error", title, msgs),
        }),
      }}
    >
      {children}
      <Notifications messages={messages} />
    </APP_CONTEXT.Provider>
  );
}

export function useApp() {
  const context = React.useContext(APP_CONTEXT);
  if (!context) {
    throw Error(
      "The component which invokes the useApp hook should be placed in a AppProvider.",
    );
  }
  return context;
}
