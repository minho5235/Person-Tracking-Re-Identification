import React, { useState, useEffect } from "react";
import TitleMypage from "../components/TitleMypage.tsx";
import { apisMypageVideo } from "../apis/apis_MypageVideo.js";
import {useNavigate} from 'react-router-dom';
import styled from "styled-components";
import '../App.css';
import {Modal, Spin, message} from 'antd';
import {apis_MypageVideoDelete} from "../apis/apis_MypageVideoDelete.js";
import {apis_MypageVideoLoad} from "../apis/apis_MypageVideoLoad.js";
import { apisMypageVideoTime } from "../apis/apis_MypageVideoTime.js";

function MyPage2() {
    const [videoList, setVideoList] = useState([]);
    const [video, setVideo] = useState([]);
    const [res, setRes] = useState({});         //응답받은 데이터
    const [goVideo, setGoVideo] = useState(false);

    const navigate = useNavigate();

    // 빙글빙글
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const VideoData = async () => {
            try {
                var response = await apisMypageVideo();
                setVideoList(response);
            } catch (error) {
                console.error('동영상 데이터를 가져오는 중 에러 발생:', error);
            }
        };
        VideoData();
    }, []);

    useEffect(() => {
        if(goVideo){
            res["video"] = video;
            navigate("/selectperson", {
                state:  res
            });
        }
    }, [goVideo]);

    const updateperson = async(user_idx) => {
        try {
            setLoading(true)
            const files = await apis_MypageVideoLoad(videoList[user_idx]['workspace_path']);
            const result = await apisMypageVideoTime(videoList[user_idx]['workspace_path']);
            setRes(result)
            setVideo(files);
            
            setGoVideo(true);
        } catch (error) {
            console.error('동영상을 업데이트하는 중 에러 발생:', error);
        }
        finally{setLoading(false)}
    }

    const deleteVideo = async(user_data, user_no) => {
        await apis_MypageVideoDelete(user_data,user_no);
    }

    const deleteperson = (user_idx) => {
        Modal.confirm({
            title: '',
            content: '정말 삭제하시겠습니까 ?',
            onOk(){
                if( deleteVideo(videoList[user_idx]['workspace_path'],videoList[user_idx]['user_no']) )
                {
                    window.location.replace('/Mypage2');
                }    
                else { message.error(this.content="잠시후 다시 시도해주세요.");}
            },
            onCancel() {
            }
        });
    }


    const render = () => {
        const person = [];
        for (var user_idx in videoList) {
            person.push(
                <UserIF key={user_idx}>
                    <Button value={user_idx} onClick={(e)=> deleteperson(e.target.value)}>
                            X
                    </Button>
                    <RenderButton data-user-idx={user_idx} onClick={(e) => updateperson(e.currentTarget.dataset.userIdx)}>
                        <Img src={"data:image/jpeg;base64,"+videoList[user_idx]["ThumbnailImg"]}></Img>
                        <Title>{videoList[user_idx]["workspace_title"]}</Title>
                        <Data>마지막 수정일 :{''}{videoList[user_idx]["update_date"]}</Data>
                    </RenderButton>
                </UserIF>
             );

        }
        return person;
    };

    return (
        <div>
            <Spin spinning={loading} size="large" tip="잠시만 기다려주세요 .." style={{fontSize:"15px", color: "grey", fontWeight: "bold"}}>
                <TitleMypage />
                    <div style={{display: "flex", flexWrap: "wrap", paddingLeft: 50}}>
                        {render()}
                    </div>   
            </Spin>
        </div>
    );
}

const RenderButton = styled.div`
    width: 300px;
    flex-direction: column;

`;


export default MyPage2;

const Title = styled.p`
    color:black;
    font-family: 'title';
    font-size: 40px;
    padding-left: 7px;
    margin-bottom: 2px;
`;

const Data = styled.p`
    font-size: 12px;
    padding-left: 10px;
`;


const UserIF = styled.div`
    padding: 5px;
    background-color: white;
    border-radius: 12px;
    border-style: dashed;
    border: 1px solid grey;
    font-family: 'menubar';
    margin:15px;
    margin-top: 30px;
    flex-direction: column; 

    &:hover {
        background-color: lightgray; 
    }

`;

const Img = styled.img`
    padding:5px;
    height: 280px;
    border-radius: 2px;
    width: 100%;
`;

const Button = styled.button`
    border: none;
    border-radius: 4px;
    font-size: 17px;
    cursor: pointer;
    font-family: 'title';
    flex-direction: column;
    background-color: transparent;
    margin-left: 90%;
`;