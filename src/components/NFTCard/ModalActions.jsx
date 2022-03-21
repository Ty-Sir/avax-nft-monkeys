import { ethers } from "ethers";
import { MonkeyContract, MarketplaceContract } from "../../Contracts";
import { useChain, useMoralis } from 'react-moralis';
import { useState, useEffect, useRef } from "react";
import { LoadingOutlined } from '@ant-design/icons'
import { abi } from "../../abi";
import { Button, Modal, InputNumber, message, Spin } from "antd";
import useSpeedyProvider from "../../hooks/useSpeedyProvider";
import { successModal } from "../Feedback/Feedback";

export default function ModalActions(props){
  const mountedRef = useRef(false);
  const { web3 } = useMoralis();
  const { account } = useChain();
  const { provider } = useSpeedyProvider();
  const [approved, setApproved] = useState(null);
  const [price, setPrice] = useState('');
  const [txInProgress, setTxInProgress] = useState(false);
  const [isSettingApproval, setIsSettingApproval] = useState(false);

  const putForSale = async () => {
    try {
      setTxInProgress(true);
      const signer = web3.getSigner();
      const instance = new ethers.Contract(MarketplaceContract, abi.Marketplace, signer);
      const salePrice = ethers.utils.parseUnits(price, 18)
      const listItem = await instance.setOffer(salePrice, props.tokenId, MonkeyContract, {from: account});
      const result = await listItem.wait();
      if(result.status === 1){
        message.success("Successfully Listed Item For Sale", 5);
        props.isTokenForSale();
        props.closeModal();
        setTxInProgress(false);
        setPrice('');
      }
    } catch (error) {
      message.error(error.message, 5);
      setTxInProgress(false);
    }
  }

  const setApproval = async () => {
    try {
      setIsSettingApproval(true);
      const signer = web3.getSigner();
      const instance = new ethers.Contract(MonkeyContract, abi.Monkey, signer);
      const setApproval = await instance.setApprovalForAll(MarketplaceContract, true);
      const result = await setApproval.wait();
      if(result.status === 1){
        await checkIfApproved();
        message.success("Successfully Approved To Sell", 5);
        setIsSettingApproval(false);
      }
    } catch (error) {
      message.error(error.message, 5);
      setIsSettingApproval(false);
    }
  }

  const checkIfApproved = async () => {
    const instance = new ethers.Contract(MonkeyContract, abi.Monkey, provider);
    const isApproved = await instance.isApprovedForAll(account, MarketplaceContract);
    if(!mountedRef.current) return null;
    setApproved(isApproved);
  }

  useEffect(() => {
    mountedRef.current = true;
    if(provider !== null && approved === null){
      checkIfApproved();
    }
    return () => mountedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approved, provider])

  function onChange(value) {
    setPrice(value)
  }

  const _getOfferId = async () => {
    const instance = new ethers.Contract(MarketplaceContract, abi.Marketplace, provider);
    const offerId = await instance.getTokenOffer(MonkeyContract, props.tokenId)
    return offerId[3];
  }

  const revokeSale = async () => {
    try {
      const offerId = await _getOfferId()
      setTxInProgress(true);
      const signer = web3.getSigner();
      const instance = new ethers.Contract(MarketplaceContract, abi.Marketplace, signer);
      const remove = await instance.removeOffer(offerId);
      const result = await remove.wait();
      if(result.status === 1){
        props.isTokenForSale();
        props.closeModal();
        message.success("Successfully Revoked Sale Offer", 5);
        setTxInProgress(false);
      }
    } catch (error) {
      message.error(error.message, 5);
      setTxInProgress(false);
    }
  }

  const buyMonkey = async () => {
    try {
      const offerId = await _getOfferId();
      const value = await props.getPrice();
      setTxInProgress(true);
      const signer = web3.getSigner();
      const instance = new ethers.Contract(MarketplaceContract, abi.Marketplace, signer);
      const purchase = await instance.buyMonkey(offerId, {value: value});
      const result = await purchase.wait();
      if(result.status === 1){
        await props.isTokenForSale();
        props.closeModal();
        successModal(<div>Successfully Purchased!<br/><a href="/wallet">You can now view item in your wallet here.</a></div>)
        setTxInProgress(false);
        await props.isOwner();
      }
    } catch (error) {
      message.error(error.message, 5);
      setTxInProgress(false);
    }
  }

  const changePrice = async () => {
    try {
      const offerId = await _getOfferId()
      setTxInProgress(true);
      const signer = web3.getSigner();
      const instance = new ethers.Contract(MarketplaceContract, abi.Marketplace, signer);
      const newPrice = ethers.utils.parseUnits(price, 18);
      const remove = await instance.changePrice(newPrice, offerId);
      const result = await remove.wait();
      if(result.status === 1){
        props.getPrice();
        props.closeModal();
        message.success("Successfully Change Price", 5);
        setTxInProgress(false);
        setPrice('');
      }
    } catch (error) {
      message.error(error.message, 5);
      setTxInProgress(false);
    }
  }

  if(props.type === "Sell"){
    return(
      <Modal footer={null} onCancel={props.close} title={props.type} visible={props.visible}>
        <div style={{textAlign: "center", textDecoration: "underline", fontSize: "1.25rem"}}>Steps to List Item For Sale:</div>
        <div style={{display: "flex", justifyContent: "center", fontSize: "1.125rem"}}>
          {approved ? <span>1)Enter price <br/> 2)Click Sell</span> : <span>1)Click Approve <span style={{fontSize: ".7rem"}}>(This only needs to be done once.)</span> <br/> 2)Enter price <br/> 3)Click Sell</span>}
        </div>
        <div style={{display: "flex", justifyContent: "center"}}>
          <InputNumber
            addonBefore="Enter Price:"
            addonAfter="AVAX"
            disabled={!approved || txInProgress}
            style={{
              width: "75%",
              margin: "1rem 0"
            }}
            defaultValue="0.0"
            min=".000000000000001"
            step="0.001"
            onChange={onChange}
            stringMode
          />
        </div>
        {!approved ? 
          <Button style={{marginBottom: ".5rem"}} block type="primary" shape="round" disabled={approved || isSettingApproval} onClick={setApproval}>
            {isSettingApproval ? <span>Approving <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} /></span> : "Approve"}
          </Button> 
          : 
          null
        }
        <Button block type="primary" shape="round" disabled={!approved || price === '' || txInProgress} onClick={putForSale}>
          {txInProgress ? <span>Going On Sale <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} /></span> : "Sell"}
        </Button>
      </Modal>
    )
  }
  if(props.type === "Change Price"){
    return(
      <Modal footer={null} onCancel={props.close} title={props.type} visible={props.visible}>
        <div style={{textAlign: "center", textDecoration: "underline", fontSize: "1.25rem"}}>Steps to Change Price:</div>
        <div style={{display: "flex", justifyContent: "center", fontSize: "1.125rem"}}>
          <span>1)Enter price <br/> 2)Click Change Price</span>
        </div>
        <div style={{display: "flex", justifyContent: "center"}}>
          <InputNumber
            addonBefore="Enter Price:"
            addonAfter="AVAX"
            disabled={txInProgress}
            style={{
              width: "75%",
              margin: "1rem 0"
            }}
            defaultValue="0.0"
            min=".000000000000001"
            step="0.001"
            onChange={onChange}
            stringMode
          />
        </div>
        <Button block type="primary" shape="round" disabled={price === '' || txInProgress} onClick={changePrice}>
          {txInProgress ? <span>Changing Price <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} /></span> : "Change Price"}
        </Button>
      </Modal>
    )
  }
  if(props.type === "Buy"){
    return(
      <Modal footer={null} onCancel={props.close} title={props.type} visible={props.visible}>
        <div style={{textAlign: "center", fontSize: "1.25rem", marginBottom: "1rem"}}>Click 'Buy Monkey' to Purchase</div>
        <Button block type="danger" shape="round" disabled={txInProgress} onClick={buyMonkey}>
          {txInProgress ? <span>Confirming Sale <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} /></span> : "Buy"}
        </Button>
      </Modal>
    )
  }
  if(props.type === "Revoke Sale"){
    return(
      <Modal footer={null} onCancel={props.close} title={props.type} visible={props.visible}>
        <div style={{textAlign: "center", fontSize: "1.25rem", marginBottom: "1rem"}}>Click 'Revoke Sale' to remove sale offer</div>
        <Button block type="danger" shape="round" disabled={txInProgress} onClick={revokeSale}>
          {txInProgress ? <span>Revoking Sale <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} /></span> : "Revoke Sale"}
        </Button>
      </Modal>
    )
  }
  return null;
}