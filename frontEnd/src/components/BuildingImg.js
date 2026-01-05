import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import { Col, Avatar} from 'antd';
import TimelineList from './TimelineList'
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';

import Group from 'antd/lib/input/Group';


function BuildingImg(props) {

    const location = useLocation();

    const [checkedList, setCheckedList] = useState([]);
    const [boxColors, setBoxColors] = useState(["red", "blue", "green"])


    const renderCards = () => {
        var cards = [];

        for (var i in props.TimeLine) {
            cards.push((
            <div>
                <div style={{width: "100%", 
                            margin: "0 auto", 
                            marginBottom: "10px", 
                            textAlign: "center", 
                            fontSize: "21px",
                            fontFamily: "hihi"}}>
                    <Avatar style={{marginRight:"5px"}} size={50} src={<img src={"data:image/jpeg;base64,"+location.state.people[props.TimeLine[i]].faceImg} />} />
                    인물이 나온 구간
                </div>
            </div>
            ))
           for (var videoidx in location.state.people[props.TimeLine[i]].timeline_path){
                var BtnVideoTitle = location.state.video[props.VideoIdx].name;
                var PeopleVideoTitle = location.state.people[props.TimeLine[i]].timeline_path[videoidx].title
                if( BtnVideoTitle.includes(PeopleVideoTitle)){
                    cards.push(
                        <div style={{border : `4px solid ${boxColors[videoidx]}`, borderRadius: '8px', margin : '20px', width :'200px'}}>
                            <TimelineList person_idx={props.TimeLine[i]} video_idx={videoidx}  response={location.state}/>
                        </div>
                    )
                }
           }
        };
        return cards;
    };

    const renderImg = () =>{
        if (props.VideoIdx != null) {
            var PeopleVideoTitle = location.state.video[props.VideoIdx].name;
            if( PeopleVideoTitle.includes("강의실")){
                return(<div style={{
                        position: 'absolute',
                        top: '290px', // 박스의 위쪽 위치 조정
                        left: '170px', // 박스의 왼쪽 위치 조정
                        width: '245px',
                        height: '105px',
                        backgroundColor: 'rgba(0, 0, 0, 0)', // 박스의 배경색 및 투명도 설정
                        borderColor: boxColors[props.VideoIdx], // 테두리 색상 설정
                        borderWidth: '4px', // 테두리 두께 설정
                        borderStyle: 'solid' // 테두리 스타일 설정
                        }} />)
                }
            else if(PeopleVideoTitle.includes("연구실")){
                return(<div style={{
                    position: 'absolute',
                    top: '135px', // 박스의 위쪽 위치 조정
                    left: '170px', // 박스의 왼쪽 위치 조정
                    width: '153px',
                    height: '155px',
                    backgroundColor: 'rgba(0, 0, 0, 0)', // 박스의 배경색 및 투명도 설정
                    borderColor: boxColors[props.VideoIdx], // 테두리 색상 설정
                    borderWidth: '4px', // 테두리 두께 설정
                    borderStyle: 'solid' // 테두리 스타일 설정
                    }} />)
                }
            else if(PeopleVideoTitle.includes("복도") ){
                return( <div style={{
                    position: 'absolute',
                    top: '135px', // 박스의 위쪽 위치 조정
                    left: '322px', // 박스의 왼쪽 위치 조정
                    width: '50px',
                    height: '155px',
                    backgroundColor: 'rgba(0, 0, 0, 0)', // 박스의 배경색 및 투명도 설정
                    borderColor: boxColors[props.VideoIdx], // 테두리 색상 설정
                    borderWidth: '4px', // 테두리 두께 설정
                    borderStyle: 'solid' // 테두리 스타일 설정
                }} />) }
            else if(PeopleVideoTitle.includes("엘리베이터")){
                return(
                    <div style={{
                        position: 'absolute',
                        top: '85px', // 박스의 위쪽 위치 조정
                        left: '370px', // 박스의 왼쪽 위치 조정
                        width: '47px',
                        height: '48px',
                        backgroundColor: 'rgba(0, 0, 0, 0)', // 박스의 배경색 및 투명도 설정
                        borderColor: boxColors[props.VideoIdx], // 테두리 색상 설정
                        borderWidth: '4px', // 테두리 두께 설정
                        borderStyle: 'solid' // 테두리 스타일 설정
                        }} />) }
            else if(PeopleVideoTitle.includes("화장실")){
                return(
                    <div style={{
                        position: 'absolute',
                        top: '87px', // 박스의 위쪽 위치 조정
                        left: '276px', // 박스의 왼쪽 위치 조정
                        width: '96px',
                        height: '48px',
                        backgroundColor: 'rgba(0, 0, 0, 0)', // 박스의 배경색 및 투명도 설정
                        borderColor: boxColors[props.VideoIdx], // 테두리 색상 설정
                        borderWidth: '4px', // 테두리 두께 설정
                        borderStyle: 'solid' // 테두리 스타일 설정
                        }} />)}
            else if(PeopleVideoTitle.includes("복도2")){
                return(
                    <div style={{
                        position: 'absolute',
                        top: '87px', // 박스의 위쪽 위치 조정
                        left: '125px', // 박스의 왼쪽 위치 조정
                        width: '150px',
                        height: '48px',
                        backgroundColor: 'rgba(0, 0, 0, 0)', // 박스의 배경색 및 투명도 설정
                        borderColor: boxColors[props.VideoIdx], // 테두리 색상 설정
                        borderWidth: '4px', // 테두리 두께 설정
                        borderStyle: 'solid' // 테두리 스타일 설정
                        }} />) }
            else if(PeopleVideoTitle.includes("계단")){
                return(
                    <div style={{
                        position: 'absolute',
                        top: '17px', // 박스의 위쪽 위치 조정
                        left: '45px', // 박스의 왼쪽 위치 조정
                        width: '85px',
                        height: '118px',
                        backgroundColor: 'rgba(0, 0, 0, 0)', // 박스의 배경색 및 투명도 설정
                        borderColor: boxColors[props.VideoIdx], // 테두리 색상 설정
                        borderWidth: '4px', // 테두리 두께 설정
                        borderStyle: 'solid' // 테두리 스타일 설정
                        }} />)}
        }
    }
    
    
    const onChange = (list) => {
        setCheckedList(list);
    };

    return (
        <div>
            { location.state !== null && (
                <StyledArea>
                    <div>
                        <div style={{background: 'url("/building.png")', backgroundSize: 'cover', width: '490px', height: '400px', position: 'relative'}}>
                            {renderImg()}
                        </div>
                    </div>
                    <div style={{width: "40%"}}>
                        <Group style={{width: "100%"}} value={checkedList} onChange={onChange}>
                            <Col gutter={16} style={{width: "240px"}}>
                                {renderCards()}
                            </Col>
                        </Group>
                    </div>
                </StyledArea> 
            ) }
        </div>
    );
};

export default BuildingImg;

const StyledArea = styled.div`
    margin: 0;
    width: 85%;
    align-items: flex-start;
    display: flex;
    justify-content: space-between;

`;

