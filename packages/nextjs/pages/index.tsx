import Head from "next/head";
import type { NextPage } from "next";
import { useGlobalState } from "~~/services/store/store";
import Gate from "~~/components/Gate";
import Smile from "~~/components/Smile";


const Home: NextPage = () => {
  const gateScore = useGlobalState(state => state.gateScore); // Access gateScore from the Zustand store

  return (
    <>
      <Head>
        <title>Scaffold-ETH 2 App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth-2" />
      </Head>

      <div className="flex items-center justify-center flex-col pt-10">
        {gateScore ? (
          <div className="flex justify-center items-center flex-col">
              <p className="font-semibold text-xl">Your passport score is {Number(gateScore).toFixed(2)}!</p>
            <div className="flex items-center w-full">
              <Smile />
            </div>
          </div>
        ) : (
          <Gate />
        )}
      </div>
    </>
  );
};

export default Home;
