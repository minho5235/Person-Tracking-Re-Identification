import React, { useState, useEffect } from 'react';
import {apisLogin}  from '../apis/apis_Login';
import '../App.css';
import {message, Modal} from 'antd';
import { useNavigate } from 'react-router';
import TitleModal from '../components/TitleModal';
import {Findpw} from '../apis/apis_Findpw';


const SignIn = () => {
        const navigate = useNavigate(); 

        const [id, setId] = useState('');
        const [pw, setPw] = useState('');

        const [findid, setFindid] = useState('');
        const [findname, setFindname] = useState('');
        const [findemail, setFindemail] = useState('');


        const [modalOpen, setmodalOpen] = useState(false);


        const [changepw, setChangepw] = useState('');
        const [changepw2, setChangepw2] = useState('');
        
        // 비밀번호 변경
        const [Valid, setValid] = useState(false);
        const [isValid, setisValid] = useState(false);
        

        const signin = async(event) => {
            event.preventDefault(); // 기본 제출 동작 방지
            if(id && pw != null) {
                await apisLogin(id, pw, navigate);
            }
            else {
                message.error('아이디와 비밀번호를 입력해주세요')
            }
        }

        useEffect(() => {
            if ((findid.length && findname.length) >= 1 ) {
                setValid(true);
            } 
            else {
                setValid(false);
            }
        }, [findid, findname])


        // [1] 패스워드 찾기 버튼
        const modalcheck = () => {
            setmodalOpen(true);
        };

        // [2] 비밀번호 찾기
        const btfindpw = async(e) => {
            e.preventDefault();
            if(await Findpw(findid, findname) == "success")
            {
                Modal.info({
                    title: '',
                    content: '가입하신 이메일로 임시 비밀번호 발송',
                    onOk() { }
                                });
            }
                setmodalOpen(false);
            }

        // 비밀번호 모달창 닫기
        const modalclose = () => {
            setmodalOpen(false);
        }

        return (
            <div className="form-container sign-in-container">
                <form className="form">
                    <h1 className="form-title">더부룩 민주당</h1>

                    <input style={{margin:'10px'}} type="text" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)}/>
                    <input type="password" placeholder="Pw" value={pw} onChange={(e) => setPw(e.target.value)}/>

                    <button type='submit' onClick={signin} className="form-button">LOGIN</button>

                    <p className="find-password" onClick={modalcheck}>패스워드 찾기</p>
                    

                    <TitleModal
                        title= '비밀번호 찾기'
                        content = {
                            <div>
                                <p style={{fontSize: 15, marginBottom: 15}}>비밀번호를 찾고자 하는<br/>아이디와 이름을 입력해주세요</p>
                                <div style={{marginBottom: 20}}>
                                    <input style={{marginBottom: 10, paddingBottom: 5}} type="text" placeholder="ID" value={findid} onChange={(e) => setFindid(e.target.value)}/>
                                    <input style={{marginBottom: 10, paddingBottom: 5}} type="text" placeholder="Name" value={findname} onChange={(e) => setFindname(e.target.value)}/>
                                </div>
                                    <button disabled={!Valid} style={{border:'none', backgroundColor: Valid ? "#FFDB58" : "#FFECB3", borderRadius: 9, fontSize: 15, paddingTop: 4, cursor: 'pointer', marginTop: 30}} onClick={btfindpw}>
                                            비밀번호 찾기
                                    </button>
                            </div>} 
                        visible={modalOpen}
                        onCancel={modalclose}
                    />


                </form>
            </div>
        );
}

export default SignIn;