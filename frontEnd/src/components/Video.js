import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { Avatar, Image, Modal, message, Spin } from 'antd';
import ReactPlayer from 'react-player';
import { client } from '../apis/CustomAxios';
import { Logout } from '../apis/apis_Loout';
import "../App.css";

const Videos = ( {person_idx, video_idx, timeline_idx, response}) => {

    // 빙글빙글
    const [loading, setLoading] = useState(false);

    const [hover, setHover] = useState(false);
    const [visible, setVisible] = useState(false);
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
    },[])

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

    const downloadShorts = (id, title, name, idx) => {
        var temp= {
                "id" : id,
                "title": title,
                "name" : name,
                "idx" : idx
            }
        client({
            url: "/download-video",
            data: temp,
            method: "POST",
            responseType: 'blob'    
        }).then(response => {
            var blob_data  =new Blob([response.data]);
            const url = window.URL.createObjectURL(blob_data);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(  //파일 이름
                "download",
                name+idx+".mp4"
            ); 
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            setLoading(false);
        }).catch((err) => {
            switch(err.status_code){
                case 403:
                    message.error(err["response"]["data"]["message"]);
                    Logout();
                default:
                    message.error(err["response"]["data"]["message"]);
            }
        });
    };

    return (
        <>
            <VideoItem>
                <div onMouseOver={() => setHover(true)} 
                    onMouseOut={() => setHover(false)} 
                    onClick={() => setVisible(true)}
                > 
                    {hover ? (
                        <ReactPlayer 
                            url={video  + '#t=' + response.people[person_idx].timeline_path[video_idx].timeline[timeline_idx]["start"]+","+ response.people[person_idx].timeline_path[video_idx].timeline[timeline_idx]["end"]}
                            muted={true}
                            width="100%"
                            height="auto"
                            playing={true}
                            loop
                        />
                    ) : (
                        <ReactPlayer 
                            url={video  + '#t=' + response.people[person_idx].timeline_path[video_idx].timeline[timeline_idx]["start"]+","+ response.people[person_idx].timeline_path[video_idx].timeline[timeline_idx]["end"]}
                            muted={true}
                            width="100%"
                            height="auto"
                        />
                    )}
                </div>
                <VideoMeta>
                    <div>
                        <Avatar size={{xxl: 60, xl: 60, lg: 60, md: 50, sm: 50, xs: 50}} 
                                src={<Image src={"data:image/jpeg;base64,"+response.people[person_idx].faceImg} />} />
                    </div>
                    <div style={{paddingLeft: "15px", paddingRight: "10px", textAlign: "left", flexGrow: "1", justifyContent: "center", fontSize: "15px"}}
                        onClick={() => setVisible(true)}>
                        <div style={{fontWeight: "bold", fontFamily: 'hihi'}}>{response.people[person_idx].name+"/"+response.people[person_idx].timeline_path[video_idx].title}</div>
                        <div style={{color: "#555555", marginTop: 5, fontFamily: 'menubar', fontSize: 13}}>{
                            getTime(0, response.people[person_idx].timeline_path[video_idx].timeline[timeline_idx]["start"])
                            +"~"+getTime(0, response.people[person_idx].timeline_path[video_idx].timeline[timeline_idx]["end"])}
                        </div>
                        {/* <div style={{color: "#555555"}}>keywords</div> */}
                    </div>
                </VideoMeta>
            </VideoItem>
                <Modal
                    title={`${response.people[person_idx].name+" / "+response.people[person_idx].timeline_path[video_idx].title}`}
                    centered
                    visible={visible}
                    cancelText="Close"
                    onCancel={() => {setVisible(false)}}
                    width={900}
                    destroyOnClose={true}
                    okText="Download"
                    onOk={() => {
                        downloadShorts(response.id, response.people[person_idx].timeline_path[video_idx].title ,response.people[person_idx].name, timeline_idx);
                        setLoading(true);
                    }}
                >
                    <Spin spinning={loading} size="large" tip="잠시만 기다려주세요 .." style={{fontSize:"15px", color: "grey", fontWeight: "bold"}}>
                        <ReactPlayer 
                            url={video + '#t=' + response.people[person_idx].timeline_path[video_idx].timeline[timeline_idx]["start"]+","+ response.people[person_idx].timeline_path[video_idx].timeline[timeline_idx]["end"]}
                            width="100%"
                            height="auto"
                            playing={true}
                        />
                    </Spin>
                </Modal>
        </>
    );
};

export default Videos;

const VideoItem = styled.div`
    border-radius: 10px;
    position: relative;
    margin-bottom: 10px;
    padding: 10px;
    word-break: break-all;
    overflow: auto;
    cursor : pointer;
    &:hover {
        background-color: #f1f1f1;
    }
`;

const VideoMeta = styled.div`
    padding: 3px;
    display: flex;
    align-items: center;
`;