import { StrictMode } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { MoralisProvider } from "react-moralis";
import "./index.css";
// import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

const Application = () => {
  return (
    <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
      <App />
    </MoralisProvider>
  );
};

ReactDOM.render(
  <StrictMode>
    <Application />
  </StrictMode>,
  document.getElementById("root"),
);