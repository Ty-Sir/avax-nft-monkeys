import { useState, useEffect } from "react";
import { ethers } from "ethers";

const SPEEDY_NODE_URL = process.env.REACT_APP_SPEEDY_NODE_URL;

export default function useSpeedyProvider() {
  const [provider, setProvider] = useState(null);

  const handleSetProvider = () =>{
    const speedyNodeProvider = new ethers.providers.JsonRpcProvider(SPEEDY_NODE_URL);
    setProvider(speedyNodeProvider);
  }

  useEffect(() => {
    if(provider === null) handleSetProvider();
  }, [provider]);

  return { provider };
}