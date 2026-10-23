function Sidebar({
  open,
  close,
  activePage,
  setPage,
}) {
  if (!open) {
    return null;
  }

  const pages = [
    {
      name: "dashboard",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      name: "habits",
      label: "Daily Habits",
      icon: "✓",
    },
    {
      name: "calendar",
      label: "Calendar",
      icon: "▦",
    },
    {
      name: "progress",
      label: "Progress",
      icon: "◔",
    },
    {
      name: "journal",
      label: "Journal",
      icon: "✎",
    },
    {
      name: "timer",
      label: "Timer",
      icon: "⏱",
    },
    {
      name: "settings",
      label: "Settings",
      icon: "⚙",
    },
  ];

  function handlePageClick(page) {
    setPage(page);
    close();
  }

  return (
    <div
      className="drawer-overlay"
      onClick={close}
    >
      <aside
        className="drawer"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="close-drawer"
          onClick={close}
        >
          ×
        </button>

        <div className="drawer-brand">
          <div className="drawer-logo">
            ❄
          </div>

          <div>
            <h3>WINTER ARC</h3>
            <p>Your personal journey</p>
          </div>
        </div>

        <div className="drawer-navigation">
          {pages.map((page) => (
            <button
              type="button"
              key={page.name}
              className={
                activePage === page.name
                  ? "drawer-item active"
                  : "drawer-item"
              }
              onClick={() =>
                handlePageClick(page.name)
              }
            >
              <span>{page.icon}</span>
              {page.label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;