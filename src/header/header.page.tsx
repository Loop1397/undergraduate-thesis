import "./header.css";

function Header() {
  return (
    <header>
      <div style={{ gap: "6px" }}>
        <p>MASTER</p>
        <p
          style={{
            color: "#ffffff",
            backgroundColor: "#6775c9",
            height: "34px",
            padding: "6px",
            borderRadius: "4px",
          }}
        >
          VIZ
        </p>
      </div>
    </header>
  );
}

export default Header;
