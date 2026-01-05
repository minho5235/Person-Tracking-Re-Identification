import { message } from "antd";
import { client } from "./CustomAxios";
import {Logout} from "./apis_Loout";

export const EmailcodeCheck = async (email,code) => {
    return await client.post(`/user/email/auth/check/${email}/${code}`)
    .then(response=>{
        return "success";
    })
    .catch((err) => {
       return "fail";
    })
}
