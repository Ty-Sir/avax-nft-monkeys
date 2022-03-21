import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "../../helpers/formatters";
import { Button, Card, Modal } from "antd";
import { useState, useCallback, useEffect } from "react";
import Address from "../Address/Address";
import { SelectOutlined } from "@ant-design/icons";
import { getExplorer } from "../../helpers/networks";
import Text from "antd/lib/typography/Text";
import { connectors } from "./config";

const styles = {
  account: {
    height: "42px",
    padding: "0 .5rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "fit-content",
    borderRadius: "12px",
    backgroundColor: "rgb(244, 244, 244)",
    cursor: "pointer",
  },
  text: {
    // color: "rgb(136, 0, 255)",
    cursor: "pointer"
  },
  connector: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "auto",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
    padding: "20px 5px",
    cursor: "pointer",
  },
  icon: {
    alignSelf: "center",
    fill: "rgb(40, 13, 95)",
    flexShrink: "0",
    marginBottom: "8px",
    height: "30px",
  },
};

export default function Account() {
  const { authenticate, isAuthenticated, chainId, logout, user } = useMoralis();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  const accountChanged = useCallback(async() => {
    window.ethereum.on('accountsChanged', function (accounts) {
      logout();
      window.localStorage.removeItem("connectorId");
      window.location.reload();
    })
  },
    [logout],
  )

  useEffect(() => {
    if(window.ethereum){
      accountChanged();
    }
  }, [accountChanged]);

  const chainChanged = useCallback(() => {
      window.ethereum.on("chainChanged", () => {
        logout();
        window.localStorage.removeItem("connectorId");
        window.location.reload();
      });
  },
    [logout],
  )

  useEffect(() => {
    if(window.ethereum){
      chainChanged();
    }
  }, [chainChanged]);

  return (
    <>
   {!isAuthenticated || !user ?    
      <> 
        <div style={styles.account} onClick={() => setIsAuthModalVisible(true)}>
          <p style={styles.text}>Connect</p>
        </div>
        <Modal
          visible={isAuthModalVisible}
          footer={null}
          onCancel={() => setIsAuthModalVisible(false)}
          bodyStyle={{
            padding: "15px",
            fontWeight: "500"
          }}
          style={{ fontSize: "16px" }}
          width="20rem"
        >
          <div style={{ padding: "10px", display: "flex", justifyContent: "center", fontWeight: "700", fontSize: "20px" }}>
            Connect Wallet
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {connectors.map(({ title, icon, connectorId }, key) => (
              <div 
                style={styles.connector}
                key={key}
                onClick={async () => {
                  try {
                    await authenticate({ provider: connectorId });
                    window.localStorage.setItem("connectorId", connectorId);
                    setIsAuthModalVisible(false);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                <img src={icon} alt={title} style={styles.icon} />
                <Text style={{ fontSize: "14px" }}>{title}</Text>
              </div>
            ))}
          </div>
        </Modal>
      </>
    :
      <>
        <div className="user-in-nav" style={styles.account} onClick={() => setIsModalVisible(true)}>
          <p style={styles.text}>{getEllipsisTxt(user.get('ethAddress'), 6)}</p>
        </div>
        <Modal
          visible={isModalVisible}
          footer={null}
          onCancel={() => setIsModalVisible(false)}
          bodyStyle={{
            padding: "15px",
            fontSize: "17px", 
            width: "100%",
            overflow: 'hidden'
          }}
          style={{ fontSize: "16px", fontWeight: "700" }}
          width="20rem"
        >
          Account
          <Card
            style={{
              marginTop: "15px",
              width: "auto",
            }}
            bodyStyle={{ padding: "15px", marginTop: "5px" }}
          >
            <Address avatar="left" size={6} copyable style={{ fontSize: "20px", padding: "5px" }} />
            <div style={{ marginTop: "5px", padding: '5px' }}>
              <a href={`${getExplorer(chainId)}/address/${user.get('ethAddress')}`} target="_blank" rel="noreferrer">
                <SelectOutlined style={{ marginRight: "5px" }} />
                View on Explorer
              </a>
            </div>
          </Card>
          <Button
            size="large"
            type="primary"
            style={{
              width: "100%",
              marginTop: "10px",
              borderRadius: "0.5rem",
              fontSize: "16px",
              fontWeight: "500",
            }}
            onClick={async () => {
              await logout();
              window.localStorage.removeItem("connectorId");
              setIsModalVisible(false);
            }}
          >
            Disconnect Wallet
          </Button>
        </Modal>
        </>
      }
    </>
  );
}