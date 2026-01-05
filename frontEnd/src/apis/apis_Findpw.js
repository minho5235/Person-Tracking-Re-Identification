import { message } from "antd";
import { client } from "./CustomAxios";

export const Findpw = async (id, name) => {
    try {
        const data = {
            "id": id,
            "name": name
        };
        await client.post('/user/pw', data);
        return "success";
    }
    catch(err) {
        message.error('찾을 수 없는 아이디입니다.');
       return "fail";
    }
}
