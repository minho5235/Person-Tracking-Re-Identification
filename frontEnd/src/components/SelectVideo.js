import React, {  useState } from 'react';
import styled from "styled-components";
import { Col, Row } from 'antd';

import Videos from './Video';
import { useLocation } from 'react-router-dom';
import '../App.css';

import { TbSquareNumber2 } from "react-icons/tb";
import Group from 'antd/lib/input/Group';



function SelectVideo(props) {

    const location = useLocation();

    
    function sortByTime(a, b) {
        return a.time - b.time; // 오름차순 정렬
        // return b.time - a.time; // 내림차순 정렬
    }

    const renderCards = () => {
        var cards = [];

        for (var i in props.TimeLine) {
            const temp = [];
            for (var videoidx in location.state.people[props.TimeLine[i]].timeline_path){
                var BtnVideoTitle = location.state.video[props.VideoIdx].name;
                var PeopleVideoTitle = location.state.people[props.TimeLine[i]].timeline_path[videoidx].title
                if( BtnVideoTitle.includes(PeopleVideoTitle)){
                    for( var timelineidx in location.state.people[props.TimeLine[i]].timeline_path[videoidx].timeline){
                        temp.push(
                            <Col xxl={8} xl={8} lg={12} md={12} xs={24} key={i} style={{display: "flex"}}>
                                <Videos person_idx={props.TimeLine[i]} video_idx={videoidx} timeline_idx= {timelineidx}  response={location.state} />
                            </Col>);
                    };
                }
            };
            temp.sort(sortByTime);
            cards = cards.concat(temp);
        };
        return cards;
    };
    
    return (
        <div style={{padding: "20px"}}>
            <div style={{width: "85%", 
                margin: "0 auto", 
                marginBottom: "10px", 
                textAlign: "left", 
                fontSize: "21px",
                fontFamily: "hihi"}}
            >
                <TbSquareNumber2 style={{marginRight:'13px'}}/>다운로드 할 동영상을 선택하세요.
            </div>
            { location.state !== null && (
                <StyledArea>
                    <div style={{width: "100%"}}>
                        <Group style={{width: "100%"}}>
                            <Row gutter={16}>
                                {renderCards()}
                            </Row>
                        </Group>
                    </div>
                </StyledArea> 
            ) }
        </div>
    );
};

export default SelectVideo;

const StyledArea = styled.div`
    margin: 0 auto;
    margin-top: 40px;
    margin-bottom: 50px;
    width: 85%;
    align-items: flex-start;
    display: flex;
    justify-content: space-between;

`;