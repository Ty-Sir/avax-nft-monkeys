import "./styles/marketplace.css";
import NFTCard from "../NFTCard/NFTCard";
import { useState, useEffect, useRef} from "react";
import { ethers } from "ethers";
import { abi } from "../../abi";
import useSpeedyProvider from "../../hooks/useSpeedyProvider";
import { MonkeyContract, MarketplaceContract } from "../../Contracts";
import { Row, Col, Spin, Radio, Pagination } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function Marketplace() {
  const mountedRef = useRef(false);
  const { provider } = useSpeedyProvider();
  const [tokenIdArray, setTokenIdArray] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(10);

  const handleGetTokenIds = async () =>{
    const instance = new ethers.Contract(MonkeyContract, abi.Monkey, provider);
    const tokenIds = await instance.totalMinted();
    getRecentForSaleItems(tokenIds);
  }

  useEffect(() => {
    mountedRef.current = true;
    if(provider !== null) handleGetTokenIds();
    return () => mountedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);


  const getRecentForSaleItems = async (tokenIds) => {
    if(!mountedRef.current) return null;
    try {
      const instance = new ethers.Contract(MarketplaceContract, abi.Marketplace, provider);
      let tempArray = [];
      for (let i = 0; i < tokenIds; i++) {
        let id = i + 1;
        let active = await instance.getTokenOffer(MonkeyContract, id);
        if(active.isActive){
          tempArray.push({
            tokenId: id,
            offerId: active.offerId,
            price: active.price
          })
        } 
      }
      tempArray = tempArray.sort((a,b) => b.offerId - a.offerId);
      if(!mountedRef.current) return null;
      setTokenIdArray(tempArray)
    } catch (error) {
      console.log(error)
    }
  }

  const recentlyListed = () => {
    if(tokenIdArray !== null || tokenIdArray.length !== 0){
      const oldData = [...tokenIdArray];
      const sorted = oldData.sort((a,b) => b.offerId - a.offerId);
      setTokenIdArray(sorted);
    }
  }

  const sortHighLow = () => {
    if(tokenIdArray !== null || tokenIdArray.length !== 0){
      const oldData = [...tokenIdArray];
      const sorted = oldData.sort((a,b) => b.price - a.price);
      setTokenIdArray(sorted);
    }
  }

  const sortLowHigh = () => {
    if(tokenIdArray !== null || tokenIdArray.length !== 0){
      const oldData = [...tokenIdArray];
      const sorted = oldData.sort((a,b) => a.price - b.price);
      if(sorted === tokenIdArray) return;
      setTokenIdArray(sorted);
    }
  }

  const onShowSizeChange = (current, pageSize) => {
    setCurrentPage(current);
    setPageCount(pageSize);
  }
  
  const changePage = (current, pageSize) => {
    setCurrentPage(current);
    setPageCount(pageSize);
  }

  if(tokenIdArray === null) return <Spin size="large" style={{display: "flex", justifyContent: "center", transform: "translateY(30vh)"}} indicator={<LoadingOutlined style={{ fontSize: 50 }} spin />} />;
  if(tokenIdArray.length === 0) return <div className="message">No monkeys for sale</div>;
  return(
    <div className="marketplace-container">
      <div className="marketplace-content">
        <div className="marketplace-title">Marketplace</div>
        <Radio.Group style={{marginBottom: "1.5rem"}} defaultValue="a" buttonStyle="solid">
          <Radio.Button value="a" onChange={recentlyListed}>Recently Listed</Radio.Button>
          <Radio.Button value="b" onChange={sortHighLow}>Price High/Low</Radio.Button>
          <Radio.Button value="c" onChange={sortLowHigh}>Price Low/High</Radio.Button>
        </Radio.Group>
        {{...tokenIdArray} &&
          <Row style={{display:"flex", justifyContent:"center"}} gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, { xs: 8, sm: 16, md: 24, lg: 32 }]}> 
            {tokenIdArray.slice((currentPage - 1) * pageCount, currentPage * pageCount).map((i) => (
              <Col xs={20} sm={16} md={12} lg={8} xl={6} key={i.tokenId}>
                <NFTCard tokenId={i.tokenId} key={i.tokenId} />
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