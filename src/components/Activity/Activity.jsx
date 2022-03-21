import { useState, useEffect, useRef } from 'react';
import { List, Divider, Avatar, Button } from 'antd';
import { useMoralisCloudFunction, useMoralisQuery } from 'react-moralis';
import { getEllipsisTxt } from "../../helpers/formatters";
import { ethers } from 'ethers';

export default function Activity(){
  const mountedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [limit, setLimit] = useState(2)
  const [activity, setActivity] = useState([]);
  const amountMinted = useMoralisCloudFunction("amountMinted");
  const amountChanged = useMoralisCloudFunction("amountChanged");
  const amountRemoved = useMoralisCloudFunction("amountRemoved");
  const amountSet = useMoralisCloudFunction("amountSet");
  const amountSold = useMoralisCloudFunction("amountSold");

  const monkeyMinted = useMoralisQuery("MonkeyMinted", query =>
    query
      .equalTo("confirmed", true)
      .descending("createdAt")
      .limit(limit),
      [limit],
  );

  const offerPriceChanged = useMoralisQuery("OfferPriceChanged", query =>
    query
      .equalTo("confirmed", true)
      .descending("createdAt")
      .limit(limit),
      [limit],
  );

  const offerRemoved = useMoralisQuery("OfferRemoved", query =>
    query
      .equalTo("confirmed", true)
      .descending("createdAt")
      .limit(limit),
      [limit],
  );

  const offerSet = useMoralisQuery("OfferSet", query =>
    query
      .equalTo("confirmed", true)
      .descending("createdAt")
      .limit(limit),
      [limit],
  );

  const offerSold = useMoralisQuery("OfferSold", query =>
    query
      .equalTo("confirmed", true)
      .descending("createdAt")
      .limit(limit),
      [limit],
  );

  const cleanData = () => {
    if(!mountedRef.current) return null;
    setLoading(true);
    let tempArray = [];
    for (let i = 0; i < monkeyMinted.data.length; i++) tempArray.push(monkeyMinted.data[i]);
    for (let i = 0; i < offerPriceChanged.data.length; i++) tempArray.push(offerPriceChanged.data[i]);
    for (let i = 0; i < offerRemoved.data.length; i++) tempArray.push(offerRemoved.data[i]);
    for (let i = 0; i < offerSet.data.length; i++) tempArray.push(offerSet.data[i]);
    for (let i = 0; i < offerSold.data.length; i++) tempArray.push(offerSold.data[i]);
    if(!mountedRef.current) return null;
    let arrayToShow = [];
    for (let i = 0; i < tempArray.length; i++) {
      if(tempArray[i].className === "MonkeyMinted"){
        arrayToShow.push({
          id: tempArray[i].id,
          avatar: <Avatar style={{backgroundColor: '#1890ff'}}>MINT</Avatar>,
          createdAt: tempArray[i].attributes.block_timestamp,
          title: getEllipsisTxt(tempArray[i].attributes.minter),
          description: `Just Minted: Avax Monkey ${tempArray[i].attributes.uid}`
        })
      }
      if(tempArray[i].className === "OfferPriceChanged"){
        arrayToShow.push({
          id: tempArray[i].id,
          avatar: <Avatar style={{backgroundColor: '#9254de'}}>UPDATE</Avatar>,
          createdAt: tempArray[i].attributes.block_timestamp,
          title: getEllipsisTxt(tempArray[i].attributes.owner),
          description: `Changed the price of Avax Monkey ${tempArray[i].attributes.tokenId} to ${ethers.utils.formatEther(tempArray[i].attributes.price)} AVAX`
        })
      }
      if(tempArray[i].className === "OfferRemoved"){
        arrayToShow.push({
          id: tempArray[i].id,
          avatar: <Avatar style={{backgroundColor: '#ff4d4f'}}>REVOKE</Avatar>,
          createdAt: tempArray[i].attributes.block_timestamp,
          title: getEllipsisTxt(tempArray[i].attributes.owner),
          description: `Revoked sale for Avax Monkey ${tempArray[i].attributes.tokenId}`
        })
      }
      if(tempArray[i].className === "OfferSet"){
        arrayToShow.push({
          id: tempArray[i].id,
          avatar: <Avatar style={{backgroundColor: '#36cfc9'}}>LIST</Avatar>,
          createdAt: tempArray[i].attributes.block_timestamp,
          title: getEllipsisTxt(tempArray[i].attributes.seller),
          description: `Listed Avax Monkey ${tempArray[i].attributes.tokenId} for ${ethers.utils.formatEther(tempArray[i].attributes.price)} AVAX`
        })
      }
      if(tempArray[i].className === "OfferSold"){
        arrayToShow.push({
          id: tempArray[i].id,
          avatar: <Avatar style={{backgroundColor: '#52c41a'}}>SALE</Avatar>,
          createdAt: tempArray[i].attributes.block_timestamp,
          title: getEllipsisTxt(tempArray[i].attributes.buyer),
          description: `Bought Avax Monkey ${tempArray[i].attributes.tokenId} to ${getEllipsisTxt(tempArray[i].attributes.buyer)} for ${ethers.utils.formatEther(tempArray[i].attributes.price)} AVAX`
        })
      }
    }
    arrayToShow = arrayToShow.sort((a,b) => b.createdAt - a.createdAt);
    if(!mountedRef.current) return null;
    setActivity(arrayToShow);
    handleHasMore(arrayToShow.length);
    setLoading(false);
  }

  const handleHasMore = (activityLength) => {
    let count = 0;
    count += amountMinted.data;
    count += amountChanged.data;
    count += amountRemoved.data;
    count += amountSet.data;
    count += amountSold.data;
    activityLength + 1 < count ? setHasMore(true) : setHasMore(false);
  }
  

  useEffect(() => {
    mountedRef.current = true;
    if(!monkeyMinted.isFetching && !offerPriceChanged.isFetching && !offerRemoved.isFetching && !offerSet.isFetching && !offerSold.isFetching){
      cleanData();
    }
    return () => mountedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monkeyMinted.isFetching, offerPriceChanged.isFetching, offerRemoved.isFetching, offerSet.isFetching, offerSold.isFetching])

  const loadMoreData = () => {
    if(loading) return;
    if(!mountedRef.current) return null;
    setLimit(limit + 2)
    if(monkeyMinted.error || offerPriceChanged.error || offerRemoved.error || offerSet.error || offerSold.error){
      setLoading(false);
    }
  };

  return (
    <div style={{padding: "1rem 2rem 2rem"}}>
      <div
        style={{
          textAlign: "center",
          marginBottom: "1rem",
          fontSize: "2rem",
          fontWeight: "800"
        }}
      >Recent Activity
      </div>
      <div
        id="scrollableDiv"
        style={{
          maxWidth: "500px",
          height: "60vh",
          overflow: 'auto',
          padding: '0 16px',
          borderRadius: "10px",
          margin: "0 auto",
          border: '1px solid rgba(140, 140, 140, 0.35)',
        }}
      >
        <List
          dataSource={activity}
          renderItem={item => (
            <List.Item key={item.id}>
              <List.Item.Meta
                avatar={item.avatar}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
        <div>{hasMore? <Divider plain><Button onClick={loadMoreData}>Load More</Button></Divider> : <Divider style={{justifyContent: "center"}} plain>This is the end my friend 🦧</Divider> }</div>         
      </div>
    </div>
  );
}