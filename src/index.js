import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import Parse from "parse";
import "./index.css";
import { Provider } from "@shopify/app-bridge-react";
import { parseQuery } from "./utils/url";
import AppRoutes from "./routes";
import { ShopContext } from "./context";

Parse.initialize(
  process.env.REACT_APP_API_SHOPLOOKS_PARSE_APP_ID,
  process.env.REACT_APP_API_SHOPLOOKS_PARSE_JSKEY
);
Parse.serverURL = process.env.REACT_APP_API_SHOPLOOKS_SERVER_URL + "/parse";

const { host, shop = "" } = parseQuery(window.location.search);
if (!host) {
  ReactDOM.render(
    <React.StrictMode>
      <ChakraProvider>
        <BrowserRouter>
          <ShopContext.Provider value={shop}>
            <AppRoutes />
          </ShopContext.Provider>
        </BrowserRouter>
      </ChakraProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
} else {
  ReactDOM.render(
    <React.StrictMode>
      <ChakraProvider>
        <BrowserRouter>
          <Provider
            config={{
              apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
              host: host,
              forceRedirect: true,
            }}
          >
            <ShopContext.Provider value={shop}>
              <AppRoutes />
            </ShopContext.Provider>
          </Provider>
        </BrowserRouter>
      </ChakraProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
}
