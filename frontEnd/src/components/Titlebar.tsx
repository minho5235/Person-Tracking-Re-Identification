import React, { useRef, useState}from "react";
import styled from "styled-components";
import { Link as LinkS} from 'react-router-dom';
import { FiMenu } from "react-icons/fi";
import '../App.css';
import { Logout } from "../apis/apis_Loout";

import { LuUser2 } from "react-icons/lu";
import { IoIosNotifications } from "react-icons/io";
import { FaHouseChimneyUser } from "react-icons/fa6";
import { FcLike } from "react-icons/fc";

import TitleModal from "./TitleModal";
import { getCookie } from "../apis/apis_Cookie";


const Titlebar = () => {


    const MainHome = () => {
        window.location.href = '/home';
    }

    const handlelogout = () => {
        Logout();
    }

    var username = sessionStorage.getItem("UserName");

    const droDownRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleMouseEnter = () => {
        setIsOpen(true);
    };
    
    const handleMouseLeave = () => {
        setIsOpen(false);
    };

    const mypage = () => {
        window.location.href = '/MyPage1';
    }

    const [modalOpen, setmodalOpen] = useState(false);
    const modalcheck = () => {
        setmodalOpen(true);
    };

    const modalclose = () => {
        setmodalOpen(false);
    }


    return (
            <Nav>
                <NavbarContainer>
                    <NavLogo onClick={MainHome}>
                        HOME
                    </NavLogo>
                    <MoblieIcon>
                        <FiMenu />
                    </MoblieIcon>

                    <NavMenu>
                        <NavItem>
                            <div className="username" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                                <LuUser2 /> {''} 반갑습니다, {''}{username}{''}님
                                {isOpen && (
                                    <ul ref={droDownRef} className="titleul">
                                        <li>
                                            <button className="Introduction" onClick={modalcheck}> <IoIosNotifications />{'⠀'}서비스 소개</button>
                                            <button className="mypagetitlebutton" onClick={mypage}><FaHouseChimneyUser />{'⠀'}마이페이지</button>
                                        </li>
                                    </ul>
                                )}
                                <TitleModal
                                    title= '더부룩 민주당'
                                    content = {
                                    <div>
                                        <div>
                                        저희 사이트는 사용자가 제공하는 동영상이나 동영상 URL을 받아 얼굴인식 기술을 활용하여 <br/>해당 동영상에서 특정 인물만을 추출하는 숏폼 제작 프로그램을 운영하고 있습니다. <br/><br/>
                                        사용자는 본 서비스를 통해 원하는 인물의 등장 부분만을 간추려서 엑기스한 콘텐츠를 손쉽게 즐길 수 <br/>있습니다. 더불어, 동영상 분석 결과를 기반으로 이미지를 자동으로 추출하여 대표 이미지와 인물의 <br/>이름을 제공함으로써 사용자가 누리는 시청 경험을 더욱 향상시킬 수 있습니다. <br/><br/>
                                        우리는 사용자들의 의견을 소중히 여겨 기존 기능을 개선하고 새로운 기능을 지속적으로 추가함으로써, 더 다양하고 풍부한 경험을 제공할 수 있도록 노력하고 있습니다.<br/><br/>
                                        </div>
                                        <div style={{fontSize: 14, color:'red'}}>
                                            <FcLike /> 손쉬운 사용과 뛰어난 성능으로, 당신이 좋아하는 스타나 특정 인물에 더욱 가까워질 수 있는 서비스를 더부룩 민주당에서 제공합니다. <FcLike />
                                        </div>
                                    </div>} 
                                    visible={modalOpen}
                                    onCancel={modalclose}
                                />
                            </div>
                        </NavItem>
                        <NavItem>
                            <button className="logoutbt" onClick={handlelogout}>LOGOUT</button>
                        </NavItem>
                    </NavMenu>
                </NavbarContainer>
            </Nav>
    );
};

export default Titlebar;



const Nav = styled.div`
    background: #1FD8AF;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    position: sticky;
    top: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);


    @media screen and(max-width: 960px) {
        transition: 0.8s all ease;
    }
`;

const NavbarContainer = styled.div`
    display: flex;
    justify-content: space-between;
    height: 80px;
    width: 100%;
`;

export const MoblieIcon = styled.div`
    display: none;
    margin-bottom: 10px;
    @media screen and (max-width: 768px){
        display:block;
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(-100%, 60%);
        font-size: 1.8rem;
        cursor: pointer;
        color: #fff;
    }
`;

const NavLogo = styled.div`
    color: white;
    justify-content:flex-start ;
    cursor:pointer;
    font-size: 40px;
    display: flex;
    align-items: center;
    font-weight: bold;
    text-decoration: none;
    font-family: 'title';
    padding-top: 10px;
    padding-left: 20px;
`;

const NavMenu = styled.ul`
    display: flex;
    align-items: center;
    list-style: none;
    text-align: center;
    margin-right: -22px;

    @media screen and (max-width: 768px) {
        display: none;
    }
`;

const NavItem = styled.li`
    height: 80px;
    padding-top: 9px;
    padding-right: 40px;
`;

const NavLinks = styled(LinkS)`
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: 0 1rem;
    height: 100%;
    cursor: pointer;
    color: white;
`;


