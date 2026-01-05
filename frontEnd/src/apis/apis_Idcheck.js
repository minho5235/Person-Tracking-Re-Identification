import { message } from "antd";
import { client } from "./CustomAxios";
import {Logout} from "./apis_Loout";

export const CheckId = async (id) => {
    return await client.post(`/user/join/${id}`)
    .then(response=>{
        return "success";
    })
    .catch((err) => {
       return "fail";
    })
}