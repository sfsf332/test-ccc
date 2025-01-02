"use client";

import React, { useEffect, useState } from "react";
import { TextInput } from "@/src/components/Input";
import { Button } from "@/src/components/Button";
import { useGetExplorerLink } from "@/src/utils";
import { useApp } from "@/src/context";
import { ButtonsPanel } from "@/src/components/ButtonsPanel";
import { Dropdown } from "@/src/components/Dropdown";
import { ccc } from "@ckb-ccc/connector-react";
import { createSpore, findSporeClustersBySigner } from "@ckb-ccc/spore";

export default function CreateSpore() {
  const { signer, createSender } = useApp();
  const { log } = createSender("Create Spore");
  const { explorerTransaction } = useGetExplorerLink();
  const [dnaText, SetDnaText] = useState<string>("");
  const [clusterId, setClusterId] = useState<string>("");
  const [clusterList, setClusterList] = useState([
    {
      id: "",
      name: "no Cluster",
    },
  ]);

  
  const CreateSporeWithCluster = async () => {
    if (!signer) return;

    const hasher = new ccc.HasherCkb(7);
    hasher.update(ccc.bytesFrom(dnaText, "utf8"));
    let dna = ccc.bytesFrom(hasher.digest());
    dna = ccc.bytesConcat(dna, ccc.bytesFrom(dnaText, "utf8"));
    // expect(dna.length === 20);
    const hexedDna = ccc.bytesTo(dna, "hex"); // no leading "0x"
    const content = `{"dna":"${hexedDna}"}`;
    console.log(clusterId)
    // Build transaction
    let { tx, id } = await createSpore({
      signer,
      data: {
        contentType: "dob/1",
        content: ccc.bytesFrom(content, "utf8"),
        clusterId: clusterId,
      },
      clusterMode: "clusterCell",
    });
    log("sporeId:", id);
    // Complete transaction
    await tx.completeFeeBy(signer);
    tx = await signer.signTransaction(tx);
    const txHash = await signer.sendTransaction(tx);
    log("Transaction sent:", explorerTransaction(txHash));
    await signer.client.waitTransaction(txHash);
    log("Transaction committed:", explorerTransaction(txHash));
  };
  const CreateSporeWithoutCluster = async () => {
    if (!signer) return;

    // Build transaction
    let { tx, id } = await createSpore({
      signer,
      data: {
        contentType: "image/svg+xml",
        content: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <image width="100%" height="100%" href="https://s3.ap-northeast-1.amazonaws.com/silentberry.co/vc-upload-1728530102698-5"/>
      <image width="30" height="40" href="btcfs://c42f7a462880e4e3f9b410bab583aad700e36a539aa6671b140a2176eb2f04aci0"/>
       <image width="30" height="40" href="btcfs://505f245626e8dd9c616d199cf1b2d655718705f56995d11a9b1ae4053ff1a2b9i1"/>
      </svg>`,
      },
    });
    log("sporeId:", id);

    // Complete transaction
    await tx.completeFeeBy(signer);
    tx = await signer.signTransaction(tx);
    // Send transaction
    const txHash = await signer.sendTransaction(tx);
    log("Transaction sent:", explorerTransaction(txHash));
    await signer.client.waitTransaction(txHash);
    log("Transaction committed:", explorerTransaction(txHash));
  };
  useEffect(() => {
    let synced = false

    if (!signer) {
      return;
    }

    (async () => {
       
      // Search Cluster cells
      console.log(1111)
      let list = [];
      for await (const cluster of findSporeClustersBySigner({
        signer,
        order: "desc",
      })) {
        if(synced) return
        console.log(cluster)
        list.push({
          id: cluster.cluster.cellOutput.type?.args||'',
          name: cluster.clusterData.name,
        });
      }
      setClusterList(prevState => [...prevState, ...list]);
    })();
    return ()=>{
        synced = true
    }
  }, [signer]);
  return (
    <div className="flex w-full flex-col items-stretch">
      <TextInput
        label="DNA"
        placeholder="Spore DNA"
        state={[dnaText, SetDnaText]}
      />

      <label className="text-sm">Select a Cluster (optional)</label>
      <Dropdown
        options={clusterList.map((cluster, i) => ({
            name: cluster.id,
            displayName: cluster.name,
            iconName: 'Wheat'
        }))}
        selected={''}
        onSelect={(clusterId) => {
            setClusterId(clusterId)
            log('Use clusterId', clusterId)
        }}
    />
      <ButtonsPanel>
        <Button
          className="self-center"
          onClick={async () => {
            clusterId.length > 0
              ? CreateSporeWithCluster()
              : CreateSporeWithoutCluster();
          }}
        >
          Create Spore
        </Button>
      </ButtonsPanel>
    </div>
  );
}
