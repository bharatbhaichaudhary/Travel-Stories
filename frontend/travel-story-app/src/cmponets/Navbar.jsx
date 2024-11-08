import React from "react";
import LOGO from "../assets/image/logo.svg";
import ProfileInfo from "./cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "./input/SearchBar";

const Navbar = ({ userInfo, searchQuery, onSearchNote, handleClearSearch, setSearchQuery }) => {
  const isToken = localStorage.getItem("token");
  const navigator = useNavigate();



  const onLogout = () => {
    localStorage.clear();
    navigator("/login");
  };
  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };
  const onClearSearch = () => {
    handleClearSearch();
    setSearchQuery("");
  };
  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10">
      <img src={LOGO} alt="travel story" className="h-9" />
      {isToken && (
        <>
          <SearchBar
            value={searchQuery}
            onChange={({ target }) => {
              console.log(target.value);
              setSearchQuery(target.value);
            }}
            handleSearch={handleSearch}
            onClearSerch={onClearSearch}
          />
          <ProfileInfo userInfo={userInfo} onLogout={onLogout} />{" "}
        </>
      )}
    </div>
  );
};

export default Navbar;
