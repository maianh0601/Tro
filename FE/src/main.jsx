// import { createRoot } from 'react-dom/client'
import "./index.css";
import App from "./App.jsx";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./Store/store.js";
import { DanhMucProvider } from "./Context/DanhMucContext.jsx";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <DanhMucProvider>
      <App />
    </DanhMucProvider>
  </Provider>
);
