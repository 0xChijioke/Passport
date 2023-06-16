import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { Address } from "./scaffold-eth";
import Image from "next/image";


const Smile = () => {
  const { address } = useAccount();
    
  const { data: yourContract } = useScaffoldContract({ contractName: "YourContract" });  
    
   
  const { data: smileBalance, isLoading: isBalanceLoading } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "balanceOf",
    args: [address],
  });

  const yourSmileBalance = smileBalance && smileBalance.toNumber && smileBalance.toNumber();
  // console.log("Your smile balance is:  ", yourSmileBalance);
  const [yourSmile, setYourSmile] = useState([]);
  
  
  const { writeAsync: mint, isLoading: isMinting } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "mintItem",
    value: "0.001",
  });





  useEffect(() => {
    const updateYourCollectibles = async () => {
      const smileUpdate = [];
      for (let tokenIndex = 0; yourSmileBalance && tokenIndex < yourSmileBalance; tokenIndex++) {
        try {
          // console.log("Getting token index", tokenIndex);
          const tokenId = await yourContract?.tokenOfOwnerByIndex(address, tokenIndex);
          // console.log("tokenId", tokenId);
          const tokenURI = await yourContract?.tokenURI(tokenId);
          // console.log("tokenURI", tokenURI);
          const jsonManifestString = atob(tokenURI?.substring(29));
          // console.log("jsonManifestString", jsonManifestString);
         
          try {
            const jsonManifest = JSON.parse(jsonManifestString);
            // console.log("jsonManifest", jsonManifest);
            smileUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourSmile(smileUpdate.reverse());
    };

    if (address) {
      updateYourCollectibles();
    }
  }, [address, yourSmileBalance, yourContract]);









    
  return (
    <div className="flex w-full flex-col justify-center items-center">
        <div>
            <button className={`uppercase ${isMinting ? "loading loading-spinner": " " } btn rounded-lg`}
                  onClick={async () => await mint()}
            >
                {isMinting ? "minting" : "mint"}
            </button>
        </div>
        <div className="mt-4 flex base-200 w-full rounded-lg space-y-5 flex-col justify-center items-center">
          {yourSmile.map((smile) => (
            <div key={smile.id} className="p-4 mb-4 flex justify-center flex-col items-center">
              <h3 className="text-lg text-center uppercase tracking-wider font-bold">{smile.name}</h3>
              <Image width={300} height={300} src={smile.image} alt={smile.name} className="mt-2" />
              <p className="text-gray-500 text-center">{smile.description}</p>
              <div className="text-base text-center flex justify-center items-center gap-2 mt-2">
                Owner: <Address address={smile.owner} />
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}

export default Smile;