import { Spin, Checkbox, Avatar, Modal, message } from 'antd';
import { client } from '../apis/CustomAxios';
import { useState, useEffect } from 'react';
import styled from "styled-components";
import { LoadingOutlined } from '@ant-design/icons';
import { Logout } from '../apis/apis_Loout';
import '../App.css';


function PeoplePanel(props) {

    const [checkedList, setCheckedList] = useState([]);
    const [loading, setLoading] = useState(false);

    const antIcon = <LoadingOutlined style={{ fontSize: 30, color: "#1B262C" }} spin />;

    useEffect(() => {
        const video_timeline = [];
        for(let idx = 0 ; idx < checkedList.length ; idx++)
        {
            video_timeline.push(checkedList[idx]);
        }
        props.getTimeline(video_timeline);

    }, [checkedList]); 

    const onChange = (list) => {
        setCheckedList(list);
    };


    const render = () => {
        const person = [];
        for (var prop in props.people) {
            person.push(
                <StyledPerson key={prop} >
                    <div>
                        <Avatar size={80} src={<img src={"data:image/jpeg;base64,"+props.people[prop].faceImg} alt={props.people[prop].name}/>} />
                    </div>
                    <div style={{paddingLeft: "10px", paddingRight: "10px", textAlign: "center",flexGrow: "1", justifyContent: "center", fontSize: "15px"}}>
                        <div>{props.people[prop].name}</div>
                    </div>
                    <div>
                        <Checkbox value={prop}></Checkbox>
                    </div>
                </StyledPerson>
            );
        }
        return person;
    };

    return (
        <StyledPanel>
            <Spin indicator={antIcon}
                spinning={loading} 
                style={{position: "absolute", top: "50%", transform: "translateY(-50%)", fontSize:"15px", color: "#1B262C", fontWeight: "bold"}} 
                size="large" 
                tip="Making shorts...">
                <div style={{maxHeight: props.height, overflow: "auto"}}>
                    <Checkbox.Group style={{width: "100%"}} value={checkedList} onChange={onChange}>
                        {render()}
                    </Checkbox.Group>
                </div>
            </Spin>
        </StyledPanel>
    );
}

export default PeoplePanel;

const StyledPanel = styled.div`
    width: 280px;
    padding: 10px;
    background-color: white;
    border-radius: 12px;
    border-style: dashed;
    border: 3px solid #1FD8AF;
    margin-left: 30px;
`;

const StyledButton = styled.div`
    margin: 0 auto;
    margin-top: 10px;
    padding: 10px;
    font-size: 14px;
    color: white;
    background-color: #CCCCCC;
    cursor : pointer;
    border-radius: 10px;
    text-align: center;
    font-family: 'hihi';
`;

const StyledPerson = styled.div`
    padding: 10px;
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    border-radius: 10px;
    &:hover {
        background-color: #f1f1f1;
    }
`;