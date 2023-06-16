import { NextApiRequest, NextApiResponse } from "next";



// Get the env variables
const API_KEY = process.env.GC_API_KEY;
const SCORER_ID = process.env.GC_SCORER_ID;


// these lines add the correct header information to the request
const headers = API_KEY ? ({
  "Content-Type": "application/json",
  "X-API-Key": API_KEY,
}) : undefined


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
 
  const GET_PASSPORT_SCORE_URI = `https://api.scorer.gitcoin.co/registry/score/${SCORER_ID}/${address}`
  
  try {
    const response = await fetch(
      GET_PASSPORT_SCORE_URI,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      res.status(200).json({ score: data.score });
  

    } else {


      res.status(response.status).json({ error: "Failed to retrieve passport score" });
    }

  } catch (error) {

    console.log("Failed to retrieve passport score:", error);
    res.status(500).json({ error: "Internal server error" });

  }
}
