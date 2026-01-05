import { message } from "antd";
import { client } from "./CustomAxios";
import {Logout} from "./apis_Loout";

export const apisMypageProfile = async () => {
    return await client.post('/profile/')
    .then(response=>{
        return response.data
    })
    .catch((err) => {
        switch(err.response.status){
            case 403:
                message.error(err["response"]["data"]["message"]);
                Logout();
            default:
                message.error(err["response"]["data"]["message"]);
        }
    })
}   