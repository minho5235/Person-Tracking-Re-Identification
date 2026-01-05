import React from "react";
import { Modal } from "antd";
import styled from "styled-components";
import '../App.css';



  
const TitleModal = ({ title, content, visible, onCancel }) => {
  
    return (
        <StyledModal
            title={title}
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={850}
        >
        <Intro>{content}</Intro>
      </StyledModal>
    );
  }
  
export default TitleModal;

const StyledModal = styled(Modal)`
    font-family: 'title';
    border: 5px;
    margin-bottom: 0px;
`;


const Intro = styled.div`
    color: black;
    padding:30px;
    font-size: 20px;
`;

