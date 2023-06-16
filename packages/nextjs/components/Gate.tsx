import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useGlobalState } from "~~/services/store/store";
import { useSignMessage } from "wagmi";
import { verifyMessage } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import Image from "next/image";


const threshold = process.env.NEXT_PUBLIC_THRESHOLD_NUMBER; // REMOVE NEXT_PUBLIC


export default function Gate() {
  const nonceRef = useRef("");
  const gateScore = useGlobalState(state => state.gateScore);
  const setGateScore = useGlobalState(state => state.setGateScore);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { address, isConnected } = useAccount({
    onDisconnect() {
      nonceRef.current = "";
      // setGateScore(null);
    },
  });



  useEffect(() => {
    let isMounted = true;
  
    async function fetchScorerMessage() {
      if (!isConnected || !address || !isMounted) {
        return; 
      }
  
      try {
        setLoading(true);
        // step #1: get the scorer message. (Optional)
        const scorerMessageResponse = await axios.get("/api/scorer-message");

        if (scorerMessageResponse.status !== 200) {
          console.error("Failed to fetch scorer message");
          return;
        }

        nonceRef.current = scorerMessageResponse.data.nonce;

        // Step #2: Sign the scorer message (Optional)
        signMessage({ message: scorerMessageResponse.data.message });

      } catch (error) {
        console.error("Error fetching scorer message:", error);
      } finally {
        setLoading(false);
      }
    }
  
    if (!isMounted) {
      return; 
    }
  
    if (!nonceRef.current) {
      fetchScorerMessage(); 
    }
  
    return () => {
      isMounted = false; 
    };
  }, [isConnected, address, nonceRef.current]);




  const { signMessage } = useSignMessage({
    async onSuccess(data, variables) {
      setLoading(true);

      // Step #3: Verify the signature
      const address = verifyMessage(variables.message, data);

      // Step #4: Submit the passport for scoring
      const submitResponse = await axios.post("/api/submit-passport", {
        address: address,
        community: process.env.NEXT_PUBLIC_GC_SCORER_ID,
        signature: data,
        nonce: nonceRef.current,
      });

      
      // Step #5: Get the passport score
      const scoreResponse = await axios.get(
        `/api/score/${address}`
      );

    
      // Check the score response status
      if (scoreResponse.data.status === "ERROR") {
        alert(scoreResponse.data.error);
        return;
      }

      if (scoreResponse.data.score >= Number(threshold)) {
        setGateScore(scoreResponse.data.score);
      } else {
        setInvalid(true);
      }

      setLoading(false);
    },
  });
  


  return (
    <div className="flex flex-col space-y-3 w-full pt-20 content-center text-xl justify-center">
      {loading && (
        <div className="flex flex-col items-center justify-center text-center">
          <Image src={"/passportLogo.svg"} alt="Passport" width={50} height={50} className="animate-spin" />
          <p className="mt-4">Checking passport score...</p>
        </div>
      )}
      {!gateScore && !invalid && (
        <div className="flex flex-col justify-center text-center">
          <p>You need to sign a message for us to check your passport score.</p>
            <p>If you have above zero score you pass our sybil resistance test!</p>
          <p>You'll be able to view the homepage. If not, you'll be asked to
          increase your score.</p>
        </div>
      )}
      {invalid && (
        <div className="w-full flex justify-center flex-col font-semibold text-center">
          <p>Configure your passport <a className="font-bold underline" target="_blank" href="https://passport.gitcoin.co/#/dashboard">here</a></p>
          <p>Once you've added more stamps to your passport, submit your passport again to recalculate your score.</p>
        </div>
      )}
    </div>
  );
}