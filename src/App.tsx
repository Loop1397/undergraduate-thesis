import { useState } from "react";
import "./App.css";
import MasterTree from "./master-tree/master-tree.page";
import Header from "./header/header.page";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Header></Header>
      <div style={{ width: "100%", height: "1px", backgroundColor: "#eeeeee" }}></div>
      <div className="container" style={{ backgroundColor: "#F3F7F9" }}>
        <MasterTree />
      </div>
    </>
  );
}

export default App;
