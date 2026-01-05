import React, { useState } from 'react';
import styled from "styled-components";
import { client } from '../apis/CustomAxios';
import { Spin, Upload, message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { InboxOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import Titlebar from '../components/Titlebar.tsx';
import { PiHandHeartFill } from "react-icons/pi";

const { Dragger } = Upload;

function UploadVideo() {
    
    const [loading, setLoading] = useState(false);
    const [next, setNext] = useState(false);
    const [files, setFiles] = useState([]); // 여러 파일을 저장할 상태
    const [res, setRes] = useState({}); // 응답받은 데이터
    const [video, setVideo] = useState('');
    const [title, setTitle] = useState('');

        // 에러
        let laugherror = false
        let faceerror = false
    
    const navigate = useNavigate();

    const props = {
        name: 'file',
        multiple : true,
        beforeUpload: file  => {
          const isMp4 = file.type === 'video/mp4';
          if (!isMp4) {
              Modal.error({
                  title: "동영상(.mp4)이 아닙니다.",
                  content: "동영상(.mp4) 파일만 업로드 가능합니다.",
                  centered: true,
                  maskClosable: true,
              });
            }
          else  {
            setFiles(prevFiles => [...prevFiles, file]); 
            return false;
          }
        },
        onRemove: file => {
          const newFileList = files.filter(item => item.uid !== file.uid);
          setFiles(newFileList);
      }
    };

    const handleClick = () => {
        // 인물 선택 페이지로 이동
        res["video"] = files
        navigate('/selectperson', {
            state: res // 선택된 파일들을 인자로 전달
        });
    };

    const videoupload = () => {
      const upload_title = title;
  
      if (files.length === 0) {
          Modal.error({
              title: "업로드할 파일이 없습니다.",
              content: "동영상 파일을 선택해주세요.",
              centered: true,
              maskClosable: true,
          });
          return;
      }
  
      if (!title) {
          Modal.error({
              title: "작업 이름이 없습니다.",
              content: "작업 이름을 작성해주세요.",
              centered: true,
              maskClosable: true,
          });
          return;
      }
  
      if (files.length > 3) {
          Modal.error({
              title: "최대 3개의 동영상 파일만 업로드 가능합니다.",
              content: "3개 이하의 동영상 파일을 선택해주세요.",
              centered: true,
              maskClosable: true,
          });
          return;
      }
  
      const formData = new FormData();
      formData.append("title", upload_title); 

      files.forEach((file) => {
          formData.append(`files`, file);
      });

  
      // 서버로 formData 전송
      setLoading(true);
      client({
          method: "post",
          url: "/upload-video/uuid",
          data: formData,
          headers: {
              "Content-Type": "multipart/form-data",
          }
      })
      .then((response) => {
          setRes(response.data);
          setLoading(false);
          setNext(true);
          message.success("파일이 성공적으로 업로드되었습니다.");
      })
      .catch((error) => {
          setLoading(false);
          message.error(error.response.data.message);
      });
  };

    return (
        <div style={{ fontFamily: 'hihi' }}>
                <Titlebar />
            <div style={{margin: 60}}>
                <Spin spinning={loading} size="large" tip="Extracting faces..." style={{ fontSize: "15px", color: "#1B262C", fontWeight: "bold"}}>
                    <StyledIntro style={{ fontSize: "19px" }}>
                        <PiHandHeartFill style={{ color: 'red', marginRight: '10px', fontSize: '25px' }} /> 작업 제목<br />
                        <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginTop: 13 }} />
                    </StyledIntro>
                    <div style={{ width: "50%", margin: "0 auto", fontSize: "19px", textAlign: "left", fontWeight: "bold", marginBottom: "15px", paddingTop: 20 }}>
                        <PiHandHeartFill style={{ color: 'red', marginRight: '10px', fontSize: '25px' }} />분석할 영상 파일을 업로드해주세요.
                    </div>
                    <Msg>영상길이에 따라 작업시간이 달라질 수 있습니다.</Msg>
                    <StyledUpload >
                        <Dragger {...props} >
                            <p className="ant-upload-drag-icon" style={{ marginBottom: '10px' }}>
                                <InboxOutlined />
                            </p>
                            <p style={{ fontSize: '17px', color: '#000000' }}>클릭하거나 파일을 드래그하여 업로드</p>
                            <p style={{ fontSize: '14px', color: '#707070' }}>mp4 포맷을 지원합니다.</p>
                        </Dragger>
                    </StyledUpload>
                    { next ? (
                        <StyledButton onClick={handleClick} style={{ backgroundColor: "#E5BD47" }}>인물 선택하기</StyledButton>
                    ) : (
                        <StyledButton onClick={videoupload}>영상 업로드하기</StyledButton>
                    )}
                </Spin>
            </div>
        </div>
    );
}
    
    export default UploadVideo;

    const Msg = styled.p`
      text-align: center;
      font-size: 12px;
      color: grey;
      padding-top:6px;
    `;
    
    const StyledIntro = styled.div`
      margin: 0 auto;
      margin-top: 10px;
      margin-bottom: 50px;
      font-size: 20px;
      width: 50%;
      text-align: left;
    `;
    
    const StyledUpload = styled.div`
      background-color: #F7F7F7;
      margin: 0 auto;
      width: 50%;
    `;
    
    const StyledButton = styled.div`
      margin: 0 auto;
      margin-top: 40px;
      margin-bottom: 50px;
      width: 50%;
      padding: 10px;
      font-size: 17px;
      color: white;
      font-weight: bold;
      background-color: #1FD8AF;
      cursor : pointer;
      border-radius: 10px;
      text-align: center;
    `;
    
    const StyledArea = styled.div`
      width: 50%;
      margin: 0 auto;
      margin-bottom: 80px;
    `;