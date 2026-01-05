import { client } from "./CustomAxios";
import { Modal, message } from "antd";
import {Logout} from "./apis_Loout";

export const apisMypageImg = async (myimage) => {
    const formData = new FormData();
    formData.append("file",myimage)
    return await client({
        method: "post",
        url: "/profile/user-img",
        data: formData,
        headers: {
            "Content-Type":"multipart/form-data",
        }
    })
    .then((reponse) => {
        Modal.success({title: "알림",
        content: reponse["data"]["message"]})
        return true;
    })
    .catch((err) => {
        switch(err.response.status){
            case 403:
                Modal.error({title: "알림",
                content: err["response"]["data"]["message"]});
                Logout();
            default:
                Modal.error({title: "알림",
                content: err["response"]["data"]["message"]});
        }
        return false;
    })
}


