import React, {useState, useRef, useEffect} from "react";
import { Modal, message } from "antd";
import TitleMypage from "../components/TitleMypage.tsx";
import {apisMypageImg} from "../apis/apis_MypageImg.js";
import {apisMypageProfile} from "../apis/apis_MypageProfile.js";
import {apisImgdelete} from "../apis/apis_MypageImgdel.js";

import '../App.css';

import { FaRegFaceFrown } from "react-icons/fa6";
import { FaRegFaceGrin } from "react-icons/fa6";
import { FaRegFaceGrinBeam } from "react-icons/fa6";
import TitleModal from '../components/TitleModal';
import {Changepw} from '../apis/apis_Changepw';

function Mypage1 () {
    let inputRef;
    const preview_URL = "/person.png"
    const [image, setImage] = useState({
            "imgURL" : preview_URL,
            "imgFile" : ""
        });

    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [userImgChange, setUserImgChange] = useState(true)

    const [modalOpen, setmodalOpen] = useState(false);

    const [changepw, setChangepw] = useState('');
    const [changepw2, setChangepw2] = useState('');

    
    useEffect(() => {
        if (changepw == changepw2 && (changepw.length && changepw2.length) >= 1) {
        } 
        else {
        }
    }, [changepw, changepw2])


    

    useEffect(() => {
        const setProfile = async()=>{
            const response =  await apisMypageProfile();
            setId ( response["id"] );
            setName (response["name"]);
            setEmail (response["email"]);

            if (response["img"] != null ) {
                setImage(prevState => ({
                    imgURL: "data:image/jpeg;base64,"+response["img"],
                    imgFile: "userImg"
                }));
            } 
        }
        setProfile();
    }, []);

    //이미지 로드
    const saveImage = (e) => {
        e.preventDefault();
        if(e.target.files[0]){
          // 새로운 이미지를 올리면 createObjectURL()을 통해 생성한 기존 URL을 폐기
          URL.revokeObjectURL(image["imgURL"]);
          setImage({
            "imgURL" : URL.createObjectURL(e.target.files[0]),
            "imgFile": e.target.files[0]} )
        }
    }
    

    // 이미지 삭제
    const deleteImage = () => {
        URL.revokeObjectURL(image["imgURL"]);
        setImage({
            imgURL: preview_URL,
            imgFile : ""
        });
    }

    useEffect(()=>{
        setUserImgChange(!userImgChange)
    }, [image.imgFile])

    useEffect(()=> {
        // 컴포넌트가 언마운트되면 createObjectURL()을 통해 생성한 기존 URL을 폐기
        return () => {
          URL.revokeObjectURL(image["imgURL"])
        }
      }, [])

    // 변경사항 저장
    const sendImageToServer = async() => {
        if(!userImgChange)
            Modal.error({title: "알림",
           content: "변경된 내용이 없습니다."});
        else if(image["imgURL"]==preview_URL)
            setUserImgChange(await apisImgdelete());
        else
            setUserImgChange(await apisMypageImg(image["imgFile"]));
    }

    const resetInputValue = () => {
        if(inputRef.current) {
            inputRef.current.value = null;
        }
    }

    const modalClick = () => {
        setmodalOpen(true);
    }


    const modalclose = () => {
        setmodalOpen(false);
    }

    // [3] 비밀번호 변경
    const btchangepw = async(e) => {
        e.preventDefault();
        if(await Changepw(id,changepw) == "success") {
          setmodalOpen(false);
          message.success('비밀번호 변경 완료');
        }
        else {
          message.success("비밀번호 변경을 실패하였습니다");
        }
    }
    
    return (
        <div style={{backgroundColor: '#1FD8AF', paddingBottom: 170}}>
            <TitleMypage/>
            <div className="pagecontainer" style={{width:'40%', height: 330, display:"flex", backgroundColor: "white", marginLeft: '30%', marginTop: 60, borderRadius: 30}}>
                <div className="image-wrapper">
                    <div>
                        <input type="file" accept="image/*"
                                onChange={saveImage}
                                onClick={resetInputValue}
                                ref={refParam => inputRef = refParam}
                                style={{display: "none"}}
                        />
                        <div className="img-wrapper"  style={{marginBottom: 10}}>
                            <img src={image["imgURL"]}/>
                        </div>
                    </div>
                    <div className="upload-button" style={{paddingBottom:20}}>
                        <button onClick={() => inputRef.click()} className="prebt">
                            업로드
                        </button>
                        <button onClick={deleteImage} className="delbt">
                            삭제
                        </button>

                    </div>
                </div>
                <div className="information-wrapper">
                    <table>
                      <tbody>
                            <tr>
                                <td><FaRegFaceFrown /> {''}이름 : {name}</td>

                            </tr>
                            <tr>
                                <td><FaRegFaceGrin /> {''}ID : {id}</td>
                            </tr>                         
                            <tr>
                                <td><FaRegFaceGrinBeam /> {''}이메일 : {email}</td>
                            </tr>

                      </tbody>
                      <button onClick={modalClick} className="uplobt">
                        비밀번호 변경
                      </button>
                      <button style={{marginLeft: 140}} onClick={sendImageToServer} className="uplobt">
                        저장
                      </button>
                    </table>
                </div>
            </div>
            <TitleModal
                title= '비밀번호 변경'
                content = {
                    <div>
                        <p style={{fontSize: 15, marginBottom: 15}}>새로운 비밀번호를 입력하세요</p>
                            <div>
                                <input type="password" style={{marginBottom: 10, paddingBottom: 5}} placeholder="비밀번호" value={changepw} onChange={(e) => setChangepw(e.target.value)}/>
                                <input type="password" style={{marginBottom: 10, paddingBottom: 5}}  placeholder="비밀번호 확인" value={changepw2} onChange={(e) => setChangepw2(e.target.value)}/>
                            </div>
                            <button style={{border:'none', borderRadius: 9, fontSize: 15, paddingTop: 4, cursor: 'pointer', marginTop: 30}} onClick={btchangepw}>
                                변경
                            </button>
                    </div>} 
                visible={modalOpen}
                onCancel={modalclose}
            />
        </div>
    );
}

export default Mypage1;

