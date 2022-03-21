import "./styles/mint.css";
import { useState, useEffect } from "react";
import { Button, Spin, Row, Col } from "antd";
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { successModal, errorModal, infoModal } from "../Feedback/Feedback";
import { ethers } from "ethers";
import { LoadingOutlined } from '@ant-design/icons'
import { abi } from "../../abi";
import { useMoralis, useChain } from "react-moralis";
import useSpeedyProvider from "../../hooks/useSpeedyProvider";
import { MonkeyContract } from "../../Contracts";

export default function Mint(){
  const { web3, user } = useMoralis();
  const { chainId, account } = useChain();
  const { provider } = useSpeedyProvider();
  const [value, setValue] = useState(1);
  const [amountMinted, setAmountMinted] = useState(null);
  const [isMinting, setIsMinting] = useState(false);

  const getAmountMinted = async () =>{
    try {
      const instance = new ethers.Contract(MonkeyContract, abi.Monkey, provider);
      const amount = await instance.totalMinted();
      setAmountMinted(amount.toString());
    } catch (error) {
      errorModal(error.message);
    }
  }

  useEffect(() => {
    if(provider !== null && amountMinted === null) getAmountMinted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, amountMinted]);

  const handleAmountDecrement = () =>{
    if(value > 1) setValue(value - 1);
  }
  const handleAmountIncrement = () =>{
    if(value < 100)  setValue(value + 1);
  }
  const handleReset = () => setValue(1);

  const mintMonkey = async () =>{
    try {
      if(!user){
        infoModal("Please connect wallet.");
        return;
      }
      if(chainId !== "0xa86a"){
        infoModal("Please switch to Avalanche to mint."); 
        return;
      }
      setIsMinting(true);
      const signer = web3.getSigner();
      const instance = new ethers.Contract(MonkeyContract, abi.Monkey, signer);
      const cost = (value * .444).toString();
      const mint = await instance.mint(value, {from: account, value: ethers.utils.parseUnits(cost, 'ether')});
      const result = await mint.wait(2);
      if(result.status === 1){
        successModal(<div>Great Job Minting {value}!<br/><a href="/wallet">Click here to view.</a></div>);
        await getAmountMinted();
        setIsMinting(false);
      }
    } catch (error) {
      setIsMinting(false);
      errorModal(error.message);
    }
  }

  const grammarFix = value === 1 ? `${value} Monkey` : `${value} Monkeys`;

  const mintText = isMinting ? <span>Minting <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /></span> : `Mint ${grammarFix}`;

  return(
    <>
      <div className="scroll-container">
        <div className="scroll-text">
          {Array.from({length: 20}, (_, i) => <span key={i}>{amountMinted === 222 ? " 🍌 SOLD OUT" : " 🦍 AVAILABLE FOR MINTING"}</span>)}
        </div>
      </div>
      <Row style={{display:"flex", justifyContent:"center", margin: "3rem auto 0 auto"}}> 
        <Col style={{paddingTop: "2rem", paddingBottom: "1rem", backgroundColor: "rgba(255, 255, 0, 0.98)", borderRadius: "10px", boxShadow: "0px 0px 7px 3px rgba(0, 0, 0, 0.2)"}} xs={20} sm={16} md={12} lg={8} xl={6}>
          <div className="mint-title">Mint</div>
          <div className="mint">
            <div className="amount">
              <span className="amount-minted">{amountMinted === null ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /> : amountMinted}/222 Minted</span>
            </div>
            <div style={{textAlign: "center"}}>{amountMinted === 222 ? "Sold Out" : "Monkeys cost 0.444 AVAX each"}</div>
            {amountMinted === 222 ?
              <div style={{display: "flex", justifyContent: "center", padding: "5px", marginTop: ".5rem", backgroundColor: "#fff", borderRadius: "10px", fontSize: "1.25rem"}}><a href="/marketplace">Shop On Marketplace</a></div>
              :
              <>
              <div className="mint-buttons">
                <Button disabled={isMinting} style={{fontSize: "1.25rem", fontWeight:"700", lineHeight: "normal", margin: ".5rem"}} shape="round" type="primary" size="large" onClick={mintMonkey}>
                  {mintText}
                </Button>
              <div style={{display:"flex", justifyContent:"center"}}>
                <Button disabled={isMinting || value === 1} style={{margin:".5rem"}} shape="circle" icon={<MinusOutlined />} onClick={handleAmountDecrement} size="large" />
                <Button disabled={isMinting || value === 100} style={{margin:".5rem"}} shape="circle" icon={<PlusOutlined />} onClick={handleAmountIncrement} size="large" />
              </div>
              </div>
              <div className="reset-button">
                <Button style={{padding: "0"}} type="link" onClick={handleReset}>Reset</Button>
              </div>
              </>
            }
          </div>
        </Col>
      </Row>
      <Row style={{display:"flex", justifyContent:"center", margin: "3rem auto 0 auto"}}> 
        <Col style={{marginBottom: "3rem", paddingTop: "2rem", paddingBottom: "1rem", backgroundColor: "#fef", borderRadius: "10px", boxShadow: "0px 0px 7px 3px rgba(0, 0, 0, 0.2)"}} xs={20} sm={18} md={14} lg={10} xl={8}>
          <img className="image" src="./images/monkeyIcon.png" alt="Monkey Logo" draggable="false" width="100px" />
          <div className="about-title">About</div>
          <div className="about-text">
            Avax Monkeys are 222 randomly generated ERC-721 tokens on the Avalanche Network made immediately tradable on it's built-in marketplace. 
          </div>
        </Col>
      </Row>
    </>
  );
}