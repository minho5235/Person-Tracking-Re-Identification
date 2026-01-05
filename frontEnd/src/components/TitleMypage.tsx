import React from "react";
import Titlebar from "./Titlebar.tsx";
import styled from "styled-components";
import "../App.css";

const TitleMypage = () => {
  var username = sessionStorage.getItem("UserName");

  const myinforclick = () => {
    window.location.href = "/MyPage1";
  };
  const videoclick = () => {
    window.location.href = "/MyPage2";
  };

  return (
    <div>
      <Titlebar />
      <MypageContainer>
        <Mypagetitle>
          {username}
          {""}님의 MyPage
        </Mypagetitle>
        <Mypagebutton>
          <button className="informationbutton" onClick={myinforclick}>
            내정보
          </button>
          <button className="videoinformationbutton" onClick={videoclick}>
            비디오
          </button>
        </Mypagebutton>
      </MypageContainer>
    </div>
  );
};

export default TitleMypage;

const MypageContainer = styled.div`
  background-color: #bdf2e3;
  height: 140px;
  font-family: "hihi";
  padding-top: 5px;
`;

const Mypagetitle = styled.div`
  text-align: center;
  font-size: 45px;
  color: white;
  padding-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Mypagebutton = styled.div`
  text-align: center;
`;