import "./styles/wallet.css";
import NFTCard from "../NFTCard/NFTCard";
import { useState, useEffect, useRef } from "react";
import { useChain } from "react-moralis";
import { ethers } from "ethers";
import { abi } from "../../abi";
import useSpeedyProvider from "../../hooks/useSpeedyProvider";
import { MonkeyContract } from "../../Contracts";
import { Row, Col, Spin, Pagination } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function Wallet() {
  const mountedRef = useRef(false);
  const { chainId, account } = useChain();
  const { provider } = useSpeedyProvider();
  const [tokenIdArray, setTokenIdArray] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(10);

  const handleGetTokenIds = async () =>{
    if(!mountedRef.current) return null;
    const instance = new ethers.Contract(MonkeyContract, abi.Monkey, provider);
    const tokenIds = await instance.walletOfOwner(account);
    let tempArray = [];
    for (let i = 0; i < tokenIds.length; i++) {
      tempArray.push(tokenIds[i]);      
    }
    //sort to most recently minted
    tempArray = tempArray.sort((a,b) => b - a);
    if(!mountedRef.current) return null;
    setTokenIdArray(tempArray);
  }

  useEffect(() => {
    mountedRef.current = true;
    if(provider !== null && account !== null) handleGetTokenIds();
    return () => mountedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, account]);

  const onShowSizeChange = (current, pageSize) => {
    setCurrentPage(current);
    setPageCount(pageSize);
  }
  
  const changePage = (current, pageSize) => {
    setCurrentPage(current);
    setPageCount(pageSize);
  }

  if(account === null) return <div className="no-user-chain-message">Connect wallet to view owned monkeys</div>;
  if(account !== null && chainId !== "0xa86a") return <div className="no-user-chain-message">Please switch to Avalanche Mainnet</div>;
  if(tokenIdArray === null) return <Spin size="large" style={{display: "flex", justifyContent: "center", transform: "translateY(30vh)"}} indicator={<LoadingOutlined style={{ fontSize: 50 }} spin />} />;
  if(tokenIdArray.length === 0) return <div className="no-user-chain-message">No monkeys in wallet</div>;
  return(
    <div className="wallet-container">
      <div className="wallet-content">
        <div className="wallet-title">Wallet</div>
        {{...tokenIdArray} &&
          <Row style={{display:"flex", justifyContent:"center"}} gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, { xs: 8, sm: 16, md: 24, lg: 32 }]}> 
            {tokenIdArray.slice((currentPage - 1) * pageCount, currentPage * pageCount).map((id) => (
              <Col xs={20} sm={16} md={12} lg={8} xl={6} key={id}>
                <NFTCard tokenId={id} key={id} />
              </Col>
            ))}
          </Row>
        }
        <Pagination 
          style={{
            display: "flex", 
            justifyContent: "center", 
            marginTop: "2rem"
          }} 
          onChange={changePage} 
          defaultCurrent={1} 
          showSizeChanger 
          onShowSizeChange={onShowSizeChange} 
          total={tokenIdArray.length} 
        />
      </div>
    </div>
  )
}