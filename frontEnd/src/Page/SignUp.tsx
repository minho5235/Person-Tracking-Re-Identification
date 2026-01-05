import React, { useEffect, useState } from 'react';
import {signUp} from '../apis/apis_Signup';
import {CheckId} from '../apis/apis_Idcheck';
import {Modal, message} from 'antd';
import {CheckEmail} from '../apis/apis_emailcheck';

import { TfiFaceSmile } from "react-icons/tfi";
import { TfiFaceSad } from "react-icons/tfi";
import TitleModal from '../components/TitleModal';
import {EmailcodeCheck} from '../apis/apis_emailcodecheck';
import {client} from '../apis/CustomAxios';

const SignUp = () => {

    const [email, setEmail] = useState('');
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [pw, setPw] = useState('');
    const [pw2, setPw2] = useState('');
    const [ermsid, setErmsid] = useState(false);
    const [modalOpen, setmodalOpen] = useState(false);
    const [checkemail, setCheckemail]= useState('');

    const [isValid, setisValid] = useState(false);
    const regex =
          /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

    const [validemail, isValidemail] = useState(false);

    const isPasswordValid = pw.length >= 1 && pw === pw2;
    const isNameValid = name.trim() !== ''; // name 값이 빈 문자열이 아닌 경우에 유효하다고 간주
    

    useEffect(() => {
        setErmsid(false);
    }, [id])

    useEffect(() => {
        if (validemail && isPasswordValid && isNameValid && ermsid) {
            // 디버깅 목적으로 사용되는 알림
            setisValid(true);
        } else {
            setisValid(false);
        }
    } , [pw, pw2, name,email,ermsid])

    // 회원가입 전 조건 확인
    const signup = async(event) => {
        event.preventDefault(); 
        if(isValid)
            await signUp(email,id,name,pw);
        else if(!validemail) {
            Modal.error({
                title: '에러',
                content: '이메일 인증을 해주세요',
              });    
        }
        else if (!ermsid) {
            Modal.error({
                title: '에러',
                content: 'ID 중복확인을 해주세요',
              });
        }
        else if (!isNameValid) {
            Modal.error({
                title: '에러',
                content: '이름을 입력해주세요',
              });
        }
        else if(!isPasswordValid) {
            Modal.error({
                title: '에러',
                content: '비밀번호를 확인해주세요',
              });
        }
    }

    // 아이디 중복확인
    const idcheck = async(event) => {
        event.preventDefault();
        if(await CheckId(id) === "success")
        {
            Modal.success({
                title: "알림",
                content: "사용 가능한 아이디입니다"
            })
            setErmsid(true);
        }
        else
        {
            Modal.warning({
                title: "알림",
                content: "이미 사용중인 아이디입니다."
            })
            setErmsid(false);
        }
        
    }

    // 이메일 인증 (유효한 이메일이면 인증코드 전송)
    const modalcheck = async(event) => {
        event.preventDefault();
        if(!regex.test(email))
        {
            // 이메일 형식 확인
            message.error("이메일 형식이 아닙니다.");
        }
        else
        {
            // 유효한 이메일이면 확인창 모달창 열기
            if(await CheckEmail(email) == "success")
            {
                setmodalOpen(true);
            }
            else
            {
                message.error("유효하지 않은 이메일입니다.");
            }
        }
    };

    // 이메일 인증 모달창 닫기
    const modalclose = async(e) => {
        e.preventDefault();
        try{
            await client.delete(`/user/email/auth/${email}`); 
            setmodalOpen(false);
            return ;
        }
        catch(err) {
           return "fail";
        }

    }

    // 이메일 확인 코드 인증
    const emailcodebutton = async(event) => {
        event.preventDefault();
        if(await EmailcodeCheck(email, checkemail) == "success")
        {
            setmodalOpen(false)
            isValidemail(true);
            message.success("이메일 인증 완료");
        }
        else
        {
            message.error("확인코드가 아닙니다.");
        }
    }

        return (
            <div className="form-container sign-up-container">
                <form className="form">
                    <div>
                        <input style={{margin: '5px', backgroundColor: validemail ? 'lightgrey' : 'normalColor'}} readOnly ={validemail ? true : false}  placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        <button className='idcheckbutton' style={{marginBottom: 10, backgroundColor: validemail ? '#FFECB3' : '#FFDB58'}} onClick={modalcheck}>이메일 인증</button>
                        <TitleModal
                            title= '이메일 인증'
                            content = {
                                <div>
                                    <p style={{fontSize: 15}}>입력하신 이메일로 확인코드를 보냈습니다.<br/>코드를 복사하여 입력칸에 넣어주세요</p>
                                    <div>
                                        <input style={{marginBottom: 10, paddingBottom: 5}} type="text" placeholder="[이메일 확인칸]" value={checkemail} onChange={(e) => setCheckemail(e.target.value)}/>
                                    </div>
                                    <p style={{fontSize: 10, color: 'red'}}>이메일 인증 이후 이메일을 변경할 수 없습니다.</p>
                                    <button style={{border:'none', backgroundColor: '#FFDB58', borderRadius: 9, fontSize: 15, paddingTop: 4, cursor: 'pointer', marginTop: 5}} onClick={emailcodebutton}>
                                        인증
                                    </button>
                                </div>} 
                            visible={modalOpen}
                            onCancel={modalclose}
                        />
                    </div>
                    <div style={{margin:'5px'}}>
                        <input type="text" style={{width: '140px'}} placeholder="ID" value={id} onChange={(e) => setId(e.target.value)}/>
                        <button style={{marginLeft: '8px'}} className='idcheckbutton' onClick={idcheck}>중복확인</button>
                        {ermsid ? <p style={{ color: 'green', fontSize: '11px', marginTop: '2px'}}><TfiFaceSmile /> {''}사용가능한 아이디입니다.</p> : <p style={{ color: 'red', fontSize: '11px', marginTop: '2px'}}><TfiFaceSad /> {''}ID 중복확인 버튼을 눌러주세요</p>}
                    </div>
                    <input style={{margin: '5px'}} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}/>
                    <input style={{margin: '5px'}} type="password" placeholder="PassWord" value={pw} onChange={(e) => setPw(e.target.value)}/>
                    <input style={{margin: '5px'}} type="password" placeholder="PassWord Check" value={pw2} onChange={(e) => setPw2(e.target.value)}/>
                    {pw === pw2 && pw.length > 1? <p style={{ color: 'green', fontSize: '11px', marginTop: '2px'}}><TfiFaceSmile /> {''}비밀번호가 일치해요</p> : <p style={{ color: 'red', fontSize: '11px', marginTop: '2px'}}><TfiFaceSad /> {''}비밀번호가 일치하지 않아요 </p>}
                    <button type='submit' onClick={signup} disabled={!setisValid} className="form-button" style={{background: isValid ? "#FFDB58" : "#FFECB3"}}>sign up</button>
                </form>
            </div>
        );
}

export default SignUp;