import { useState } from "react";
import "./index.css";
import "./App.css";
import MasterTree from "./master-tree/master-tree.page";
import Header from "./header/header.page";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Header></Header>
      <div className="horizon"></div>
      <div className="container">
        <MasterTree />
      </div>
    </>
  );
}

export default App;
