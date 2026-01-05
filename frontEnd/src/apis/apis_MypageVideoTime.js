import { message } from "antd";
import { client } from "./CustomAxios";
import {Logout} from "./apis_Loout";

export const apisMypageVideoTime = async (user_data) => {
    return await client({
        url: `/profile/workspaceVd/${user_data}`,
        method: "POST",
    })
    .then((response) => {
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
