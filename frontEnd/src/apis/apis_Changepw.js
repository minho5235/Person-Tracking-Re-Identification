import { client } from "./CustomAxios";

export const Changepw = async (id, pw) => {
    try {
        const data = {
            "id": id,
            "new_password": pw
        };
        await client.post('/user/pw/change', data);
        return "success";
    }
    catch(err) {
       return "fail";
    }
}
