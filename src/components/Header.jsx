function Header({ openMenu }) {
  return (
    <header className="top-header">
      <div className="brand-text">
        <h1>Winter Arc</h1>
        <p>Build consistency every day.</p>
      </div>

      <button
        className="menu-button"
        onClick={openMenu}
      >
        ☰
      </button>
    </header>
  );
}

export default Header;