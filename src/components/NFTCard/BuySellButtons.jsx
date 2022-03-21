import { ethers } from "ethers";
import { MonkeyContract, MarketplaceContract } from "../../Contracts";
import { useChain } from 'react-moralis';
import { useState, useEffect, lazy, useRef } from "react";
import { abi } from "../../abi";
import { Button, Skeleton } from "antd";
import useSpeedyProvider from "../../hooks/useSpeedyProvider";
import { infoModal } from "../Feedback/Feedback";
import { getEllipsisTxt } from "../../helpers/formatters";

const ModalActions = lazy(() => import('./ModalActions'));

export default function BuySellButtons(props) {//tokenId
  const mountedRef = useRef(false);
  const { account, chainId } = useChain();
  const [active, setActive] = useState(null);
  const [owner, setOwner] = useState('');
  const [modalContent, setModalContent] = useState('');
  const { provider } = useSpeedyProvider();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [price, setPrice] = useState('');

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setModalContent('');
  }

  const isTokenForSale = async () => {
    const instance = new ethers.Contract(MarketplaceContract, abi.Marketplace, provider);
    const isActive = await instance.isTokenActive(MonkeyContract, props.tokenId);
    if(!mountedRef.current) return null;
    setActive(isActive);
  }

  useEffect(() => {
    mountedRef.current = true;
    if(provider !== null && props.tokenId !== null && active === null){
      isTokenForSale();
    }
    return () => mountedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, props.tokenId, active]);

  const isOwner = async () =>{ 
    const instance = new ethers.Contract(MonkeyContract, abi.Monkey, provider);
    const owns = await instance.ownerOf(props.tokenId);
    if(!mountedRef.current) return null;
    setOwner(owns.toLowerCase())
    props.getOwner(getEllipsisTxt(owns));
  }

  useEffect(() => {
    if(provider !== null && props.tokenId !== null && owner === ''){
      isOwner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, props.tokenId, owner]);

  const getPrice = async () => {
    const instance = new ethers.Contract(MarketplaceContract, abi.Marketplace, provider);
    const offerPrice = await instance.getTokenOffer(MonkeyContract, props.tokenId);
    const formatted = ethers.utils.formatEther(offerPrice[2].toString());
    if(!mountedRef.current) return null;
    setPrice(formatted);
    return offerPrice.price;
  }

  useEffect(() => {
    if(active){
      getPrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const handleSellModalContent = () => {
    const check = _accountChainCheck();
    if(check){
      setModalContent("Sell");
      showModal();
    }
  }
  const handleBuyModalContent = () => {
    const check = _accountChainCheck();
    if(check){
      setModalContent("Buy");
      showModal();
    }
  }
  const handleChangePriceModalContent = () => {
    const check = _accountChainCheck();
    if(check){
      setModalContent("Change Price");
      showModal();
    }
  }
  const handleRevokeModalContent = () => {
    const check = _accountChainCheck();
    if(check){
      setModalContent("Revoke Sale");
      showModal();
    }
  }

  const _accountChainCheck = () => {
    if(!account){
      infoModal("Please connect wallet.");
      return false;
    }
    if(chainId !== "0xa86a"){
      infoModal("Please switch to Avalanche to mint."); 
      return false;
    }
    return true;
  }

  if(owner === "" && active === null) return <Skeleton.Button active shape="round" block={true} />
  if(account === null){
    return(
        <>
        {active ? <div style={{marginBottom: ".5rem"}}>{price !== '' ? `${price} AVAX` : <Skeleton.Button active size="small" />}</div> : null}
        <div style={{display: "flex", justifyContent: "space-around"}}>
          <Button style={{margin: "0 .25rem"}} type="primary" shape="round" onClick={_accountChainCheck}>Buy</Button>
        </div>
      </>
    )
  } 

  return (
    <>
      {active ? <div style={{marginBottom: ".5rem"}}>{price !== '' ? `${price} AVAX` : <Skeleton.Button active size="small" />}</div> : null}
      <div style={{display: "flex", justifyContent: "space-around"}}>
        {account === owner && !active ? <Button style={{margin: "0 .25rem"}} type="primary" shape="round" onClick={handleSellModalContent}>Sell</Button> : null}
        {account !== owner && active ? <Button style={{margin: "0 .25rem"}} type="primary" shape="round" onClick={handleBuyModalContent}>Buy</Button> : null}
        {account === owner && active ? <Button style={{margin: "0 .25rem"}} shape="round" size="small" onClick={handleChangePriceModalContent}>Change Price</Button> : null}
        {account === owner && active ? <Button style={{margin: "0 .25rem"}} type="danger" size="small" shape="round" onClick={handleRevokeModalContent}>Revoke Sale</Button> : null}

        <ModalActions 
          close={handleCloseModal} 
          tokenId={props.tokenId} 
          closeModal={handleCloseModal} 
          isTokenForSale={isTokenForSale} 
          visible={isModalVisible} 
          type={modalContent}
          getPrice={getPrice}
          isOwner={isOwner} 
        />
      </div>
    </>
  );
}