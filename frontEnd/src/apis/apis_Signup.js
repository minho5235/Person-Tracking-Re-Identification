import { client } from "./CustomAxios";
import { Modal,message } from "antd";
import {Logout} from "./apis_Loout";

export const signUp = async(email,id,name,pw) => {
    const handleModalCancel = () => {
        // 모달이 닫힌 후에 실행할 로직
        window.location.href = '/';
      };
    const data = {
        "id" : id,
        "password" : pw,
        "name" : name,
        "email" : email
    };
    client.post('/user/join', data)
    .then((reponse) => {
        Modal.success( { 
            title : "알림",
            content : reponse["data"]["message"],
            onOk: handleModalCancel,
        })
    })
    .catch((err) => {
        message.error(err["response"]["data"]["message"]);
    })
};