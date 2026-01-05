import { client } from "./CustomAxios";
import {Logout} from "./apis_Loout";
import { Modal, message } from "antd";

export const apisImgdelete = async () => {
    return client.delete('/profile/img', )
    .then((response) => {
        Modal.success({title: "알림",
        content: response["data"]["message"]})
        return true;
    })
    .catch((err) => {
        switch(err.status_code){
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