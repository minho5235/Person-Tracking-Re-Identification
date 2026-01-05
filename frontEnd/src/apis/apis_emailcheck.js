import { message } from "antd";
import { client } from "./CustomAxios";
import {Logout} from "./apis_Loout";

export const CheckEmail = async (email) => {
    return await client.post(`/user/email/auth/${email}`)
    .then(response=>{
        return "success";
    })
    .catch((err) => {
       return "fail";
    })
}
