import React from "react";
import { client } from "./CustomAxios";
import { message } from "antd";



export const apis_MypageVideoDelete = async (user_data, user_no) => {
    return await client.post(`/profile/workspace/${user_data}/${user_no}`)
    .then(response=>{
        return true;
    })
    .catch((err) => {
        switch(err.status_code){
            case 403:
                message.error(err["response"]["data"]["message"]);
                return false;
            default:
                message.error(err["response"]["data"]["message"]);
                return false;
        }
    })
}