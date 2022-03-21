import { useMoralis, useNativeBalance } from "react-moralis";

const styles = {
  balance: {
    height: "42px",
    padding: "0 .5rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "fit-content",
  }
}

export default function NativeBalance() {
  const { data: balance } = useNativeBalance();
  const { user, isAuthenticated } = useMoralis();

  return(
    <>
    {!user && !isAuthenticated ?
      null
      :
      <div className="native-balance" style={styles.balance}>
        {balance.formatted}
      </div>
     }
    </>
  );
}