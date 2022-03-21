import "./styles/nftcard.css";
import { Card } from "antd";
import useSpeedyProvider from "../../hooks/useSpeedyProvider";
import { useState, useEffect, useRef, lazy } from "react";
import { ethers } from "ethers";
import { MonkeyContract } from "../../Contracts";
import { abi } from "../../abi";
import { Modal, Button, Row, Col, Image as ImageTag, Skeleton  } from "antd";
import { traitRarity } from "../../traitRarity";
import { monkeyRanking } from "../../monkeyRanking";
const { Meta } = Card;

const BuySellButtons = lazy(() => import('./BuySellButtons'));

export default function NFTCard(props){ //tokenId
  const { provider } = useSpeedyProvider();
  const [tokenImage, setTokenImage] = useState(null);
  const [attributeArray, setAttributeArray] = useState([]);
  const [rank, setRank] = useState(null);
  const [score, setScore] = useState(null);
  const mountedRef = useRef(false);
  const [owner, setOwner] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleDisplayNFT = async () => {
    const instance = new ethers.Contract(MonkeyContract, abi.Monkey, provider);
    const tokenURI = await instance.tokenURI(props.tokenId);
    await data(tokenURI);
  }

  const data = async (tokenURI) =>{
    if (!mountedRef.current) return null;   
    const response = await fetch(tokenURI);
    const metadata = await response.json();
    let tempArray = []
    for (let i = 0; i < metadata.attributes.length; i++) {
      tempArray.push(metadata.attributes[i]);
    }
    traitRarityScore(tempArray);
    getMonkeyRank();
    getOwner();
    let img = new Image();
    img.src = metadata.image;
    img.onload = () =>{
      if (!mountedRef.current) return null;   
      setTokenImage(metadata.image);
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    if(provider !== null) handleDisplayNFT();
    return () => mountedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider])

  const traitRarityScore = (attributes) => {
    const filteredArray = traitRarity.filter(o1 => attributes.some(o2 => o1.value === o2.value && o1.trait_type === o2.trait_type ));
    if (!mountedRef.current) return null;   
    setAttributeArray(filteredArray);
  }

  const getMonkeyRank = () => {
    const rank = monkeyRanking.filter(i =>{
     return i.edition === parseInt(props.tokenId);
    });
    if (!mountedRef.current) return null;   
    setRank(rank[0].rank);
    setScore(rank[0].rarity_score)
  }

  const getOwner = async (address) => {
    setOwner(address);
  }
  const ownerLoading = owner === "" ? <Skeleton.Button active size="small" /> : owner;
  return(
    <Card
      loading={tokenImage === null ? true : false}
      style={{borderRadius: "10px",  boxShadow: "0px 0px 7px 3px rgba(0, 0, 0, 0.2)", minWidth: 200}}
      cover={tokenImage !== null ?
        <ImageTag
          style={{padding: "1rem", borderRadius: "20px"}}
          src={tokenImage}
        />
        :
        <div style={{display:"flex", justifyContent: "center", padding: "5rem"}}>
          <Skeleton.Image />
        </div>
      }
    >
      <Meta
        title={`Avax Monkey ${props.tokenId}`}
        description={<>Owner: {ownerLoading}</>}
      />
      <Button type="link" onClick={showModal}>
        Properties
      </Button>
      <BuySellButtons getOwner={getOwner} tokenId={props.tokenId} />
      <Modal footer={null} onCancel={() => setIsModalVisible(false)} title={`Avax Monkey ${props.tokenId}`} visible={isModalVisible}>
        {{...attributeArray} &&
            <Row style={{display: "flex", justifyContent: "center"}} gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, { xs: 8, sm: 16, md: 24, lg: 32 }]}> 
              {attributeArray.map((attribute, idx) => (
                <Col style={{textAlign: "center"}} xs={12} sm={12} md={12} lg={8} xl={8} key={idx}>
                  <div style={{border: "1px solid #ccc", borderRadius: "5px", padding: "5px"}}>
                    <div style={{fontSize: "1rem", textDecoration: "underline"}}>{attribute.trait_type}</div>
                    <div>{attribute.value}</div>
                    <div style={{fontSize: ".75rem", fontStyle: "italic", fontWeight: "500"}}>{((1/attribute.rarity_score)*100).toFixed(2)}% have this trait</div>
                  </div>
                </Col>
              ))}
            </Row>
          }
          <div style={{textAlign: "center", marginTop: "1rem", fontSize: "1.25rem"}}>
            <div>Total Rarity Score: {score}</div>
            <div>Rank: #{rank}</div>
        </div>
      </Modal>
    </Card>
  );
}