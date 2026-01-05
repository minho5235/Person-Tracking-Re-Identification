import { message } from "antd";
import { client } from "./CustomAxios";
import {Logout} from "./apis_Loout";


export const apisMypageVideo = async () => {
    return await client.post("/profile/workspace")
    .then(response=>{
        return response.data
    })
    .catch((err) => {
        switch(err.status_code){
            case 403:
                message.error(err["response"]["data"]["message"]);
                Logout();
            default:
                message.error(err["response"]["data"]["message"]);
        }
    })
}       