import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import styled from "styled-components";
import PeoplePanel from "../components/PeoplePanel";
import BuildingImg from "../components/BuildingImg.js"
import SelectVideo from '../components/SelectVideo';
import Titlebar from '../components/Titlebar.tsx';
import '../App.css';

import { TbSquareNumber1 } from "react-icons/tb";
import { FaAlignCenter } from 'react-icons/fa6';

function SelectPerson() {

    const location = useLocation();

    const ref = useRef();
    const [height, setHeight] = useState();
    const [loaded, setLoaded] = useState(false);
    const [shortVideo, setShortVideo] = useState(false);
    const [videoTimeline, setVideoTimeline] = useState('');
    const [selectVideoIdx, setSelectVideoIdx] = useState();
    const [boxColors, setBoxColors] = useState(["red", "blue", "green"])

    const [videoSrc, setVideoSrc] = useState();


    const getVideoHeight = () => {
        if (ref.current) {
            setHeight(ref.current.clientHeight);
        }
    };

    const getTimeline = TimeList =>{
        setVideoTimeline(TimeList);
    }


    useEffect(() => {
        getVideoHeight();
    }, [loaded]);

    useEffect(() => {
        window.addEventListener("resize", getVideoHeight);
    }, []);

    useEffect(() =>{
        if( videoTimeline.length == 0)
            setShortVideo(false);
        else
            setShortVideo(true);

    }, [videoTimeline, shortVideo])

    useEffect(() =>{
        setShortVideo(!shortVideo);
    }, [selectVideoIdx])

    const navigate = useNavigate();
    useEffect(() => {
        if (!location.state) {
            navigate('/Home');
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (ref.current) {
            ref.current.load();
            setLoaded(true);
        }
    }, [videoSrc]);

    useEffect(() => {
        setVideoSrc(window.URL.createObjectURL(location.state.video[0]));
        setSelectVideoIdx(0);
    },[])


    const renderVideo = (idx) => {
        setSelectVideoIdx(idx);
        return setVideoSrc(window.URL.createObjectURL(location.state.video[idx]));
    }

    const renderbutton = () => {
        const buttons = [];
        for (let i = 0; i < location.state.video.length; i++) {
            buttons.push(
                <VideoListButton style={{border: `2px solid ${boxColors[i]}`, color : boxColors[i]}} key={i} value={0} onClick={() => renderVideo(i)}>
                    {location.state.video[i].name}
                </VideoListButton>
            );
        }
        return buttons;
    };

    return (
        <div>
            <div>
                <Titlebar/> 
            </div>
                { location.state !== null && (
                    <div>
                        <StyledArea >
                            <div style={{flexDirection: 'column', marginLeft: 50}}>
                                <div>
                                    {renderbutton()}
                                </div>
                                <div style={{flexGrow: "1", marginTop:"10px"}}>
                                    <BuildingImg TimeLine = {videoTimeline} VideoIdx = {selectVideoIdx}/>
                                </div>
                            </div>
                            <div style={{flexGrow: "1", width : "40px"}}>
                                <div style={{width: "70%", 
                                margin: "0 auto", 
                                textAlign: "left", 
                                fontWeight: "bold", 
                                paddingTop: "40px",
                                fontSize: "20px",
                                fontFamily: "hihi"}}><TbSquareNumber1 style={{marginRight:'10px'}} /> 인물을 선택하세요</div>
                                <PeoplePanel height={height} people={location.state.people} id={location.state.id} getTimeline={getTimeline} />
                            </div> 
                        </StyledArea>
                        <div style={{width: "60%", 
                                margin: "0 auto", 
                                textAlign: "left", 
                                fontWeight: "bold", 
                                paddingTop: "40px",
                                fontSize: "20px",
                                fontFamily: "hihi"}}><TbSquareNumber1 style={{marginRight:'10px'}} /> [원본 영상]</div>
                        <StyledArea style={{display: 'flex', justifyContent: 'center'}}>
                            <video style={{flexDirection: 'column'}} ref={ref} width='650px' height="400px" onLoadedData={() => {setLoaded(true)}} controls>
                                <source src={videoSrc}/>
                            </video>
                        </StyledArea>
                    </div>
                ) }
                {shortVideo && (
                    <StyledArea>
                        <div style={{flexGrow: "1"}}>
                            <SelectVideo VideoIdx = {selectVideoIdx} TimeLine = {videoTimeline}/>
                        </div>
                    </StyledArea>
                )}
        </div>
    );
}

export default SelectPerson;

const StyledArea = styled.div`
    margin: 0 auto;
    margin-top: 20px;
    margin-bottom: 20px;
    width: 70%;
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
`;

const VideoListButton = styled.button`
    cursor: pointer;
    border: none;
    background-color: #92EEDF;
    color: white;
    flex-direction: row;
    font-family: "title"
    font-size: 5px;
    margin-right: 20px;
    border-radius: 5px;
    padding: 5px 10px 5px 10px;
    margin-bottom: 5px;
`;