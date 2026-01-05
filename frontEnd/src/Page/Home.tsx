import React from "react";
import Titlebar from "../components/Titlebar.tsx";
import '../App.css';
import { FaRegHandPointRight } from "react-icons/fa";

const Home = () => {

    const mypagebt = () => {
        window.location.href = '/MyPage1';
    }
    const videobt = () => {
        window.location.href = '/uploadvideo';
    }

    return (
        <div>
            <Titlebar/>
            <div className="homecontainer" >
                <div>
                    <div style={{background: 'url("/mainimage.png")', backgroundSize: 'contain', width: '900px', height: '500px', position: 'relative', marginLeft: 260}}>
                        <button className="mypagebutton" onClick={mypagebt}>
                            <FaRegHandPointRight />{' '} 마이페이지
                        </button>
                        <button className="videobutton" onClick={videobt}>
                            <FaRegHandPointRight />{' '} 동영상 작업을 하시겠습니까 ?
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Home;