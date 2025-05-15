const TodoHeader = () => {
  return (
    <header>
      <div className="header-content">
        <div className="header-logo">
          {/* <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#FA5252" />
            <path d="M7 12.5L10 15.5L17 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg> */}
        </div>
        <h1 className="font-[Outfit]">TODO</h1>
      </div>
      <div className="header-content">
        <div className="user-avatar">
          RG
        </div>
      </div>
    </header>
  );
};

export default TodoHeader; 