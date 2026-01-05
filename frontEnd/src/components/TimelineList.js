import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { Col, Image, Modal, message, Spin } from 'antd';
import ReactPlayer from 'react-player';
import { client } from '../apis/CustomAxios';
import { Logout } from '../apis/apis_Loout';
import "../App.css";

const TimelineList = ( {person_idx, video_idx, response}) => {

    const [videoTime, setVideoTime] = useState(new Date());
    const [video, setVideo] = useState();

    useEffect(() => {
        for (var i in response.videos){
            if (response.videos[i].title == response.people[person_idx].timeline_path[video_idx].title)
            {
                setVideoTime(new Date(response.videos[i].time))
                break;
            }    
        };
        for ( var i in response.video){
            if (response.video[i].name == (response.people[person_idx].timeline_path[video_idx].title+".mp4"))
            {
                setVideo(window.URL.createObjectURL(response.video[i]))
                break;
            }   
        };
    },[video_idx])

    const getTime = (start, end) => {
        let seconds = end - start
        let min = parseInt((seconds % 3600)/60);
        let sec = Math.floor(seconds % 60);
        var temptime = new Date(videoTime);
        temptime.setMinutes(temptime.getMinutes() + min)
        temptime.setSeconds(temptime.getSeconds() + sec)

        var timeStr = String(temptime.getHours()+":"+temptime.getMinutes()+":"+temptime.getSeconds())
    
        return timeStr;
    };

    const render = () => {
        var cards = [];

        for (var i in response.people[person_idx].timeline_path[video_idx].timeline) {
            cards.push(
                <div style={{color: "#555555", marginTop: 5, fontFamily: 'hihi', fontSize: 13, textAlign: 'center', fontWeight: 'bold'}}>{
                    getTime(0, response.people[person_idx].timeline_path[video_idx].timeline[i]["start"])
                    +" ~ "+getTime(0, response.people[person_idx].timeline_path[video_idx].timeline[i]["end"])}
                </div>
            )

        };
        return cards;
    };
   

    return (
        <>
            <div>
                <Col>
                    {render()}
                </Col>
            </div>
        </>
    );
};

export default TimelineList;

