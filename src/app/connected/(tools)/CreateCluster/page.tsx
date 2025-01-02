"use client";

import React, { useState } from "react";
import { TextInput } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { Textarea } from "@/src/components/Textarea";
import { useGetExplorerLink } from "@/src/utils";
import { useApp } from "@/src/context";
import { ButtonsPanel } from "@/src/components/ButtonsPanel";
import { createSporeCluster, dob } from "@ckb-ccc/spore";
import { ccc } from "@ckb-ccc/connector-react";
function generateClusterDescriptionUnderDobProtocol(
  client: ccc.Client,
): string {
  /**
   * Generation example for DOB0
   */
  const clusterDescription = "My First DOB Cluster";

  const dob0Pattern: dob.PatternElementDob0[] = [
    {
      traitName: "Cover",
      dobType: "Number",
      dnaOffset: 0,
      dnaLength: 6,
      patternType: "rawNumber",
    },
    {
      traitName: "Level",
      dobType: "String",
      dnaOffset: 6,
      dnaLength: 1,
      patternType: "options",
      traitArgs: ["GOLD", "SILVER", "COPPER", "BLUE"],
    },
  ];
  const dob1Pattern: dob.PatternElementDob1[] = [
    {
      imageName: "IMAGE.0",
      svgFields: "attributes",
      traitName: "",
      patternType: "raw",
      traitArgs: 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"',
    },
    {
      imageName: "IMAGE.0",
      svgFields: "elements",
      traitName: "Cover",
      patternType: "options",
      traitArgs: [
        [
          ["*"],
          `<image width='100%' height='100%' href='btcfs://c42f7a462880e4e3f9b410bab583aad700e36a539aa6671b140a2176eb2f04aci0' />`,
        ],
      ],
    },

    {
      imageName: "IMAGE.0",
      svgFields: "elements",
      traitName: "Level",
      patternType: "options",
      traitArgs: [
        [
          ["*"],
          "<image width='20' height='20'  x='5' y='20' href='btcfs://8ca2da44996f5a06ad44b5bb87fd9acb71390b6c0cb1910c10b0deb8daad7f82i0' />",
        ],
      ],
    },
  ];

  const dob1: dob.Dob1 = {
    description: clusterDescription,
    dob: {
      ver: 1,
      decoders: [
        {
          decoder: dob.getDecoder(client, "dob0"),
          pattern: dob0Pattern,
        },
        {
          decoder: dob.getDecoder(client, "dob1"),
          pattern: dob1Pattern,
        },
      ],
    },
  };
  const dob1ClusterDescription = dob.encodeClusterDescriptionForDob1(dob1);
  console.log("dob1 =", dob1ClusterDescription);

  return dob1ClusterDescription;
}
export default function CreateCluster() {
  const { signer, createSender } = useApp();
  const { log } = createSender("Create Cluster");

  const { explorerTransaction } = useGetExplorerLink();
  const client = new ccc.ClientPublicTestnet();

  const [name, SetName] = useState<string>("");
  // const [description, setDescription] = useState<string>("");

  return (
    <div className="flex w-full flex-col items-stretch">
      <TextInput
        label="Name"
        placeholder="Cluster Name"
        state={[name, SetName]}
      />
      {/* <Textarea
                label="Description"
                placeholder="Cluster Description"
                state={[description, setDescription]}
            /> */}

      <ButtonsPanel>
        <Button
          className="self-center"
          onClick={async () => {
            if (!signer) return;
            let { tx, id } = await createSporeCluster({
              signer,

              data: {
                name: name,
                description: generateClusterDescriptionUnderDobProtocol(client),
              },
            });
            log("clusterId:", id);
            // Complete transaction
            await tx.completeFeeBy(signer);
            tx = await signer.signTransaction(tx);
            // Send transaction

            const txHash = await signer.sendTransaction(tx);
            log("Transaction sent:", explorerTransaction(txHash));
            await signer.client.waitTransaction(txHash);
            log("Transaction committed:", explorerTransaction(txHash));
          }}
        >
          Create Cluster
        </Button>
      </ButtonsPanel>
    </div>
  );
}
