import { Modal, message } from "antd";
import { client } from "./CustomAxios";
import { setCookie } from "./apis_Cookie";

export const apisLogin = async (id, pw, navigate) => {
  const data = {
    "id": id,
    "password": pw
  };
  try {
    const response = await client.post('/user/login', data);
    if (response.data.token) {
      setCookie("ACCESS_TOKEN", response.data.token, {
        path: "/",
        sameSite: "strict",
        httpyOnly: true
      });
      sessionStorage.setItem("UserName", response.data.name);

      Modal.success({
        title: "알림",
        content: "로그인 성공"
      });

      navigate('/home'); 
    } else {
      // 로그인 실패 처리
    }
  } catch (err) {
    message.error(err["response"]["data"]["message"]);
  }
};