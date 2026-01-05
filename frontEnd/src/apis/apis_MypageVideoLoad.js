import React from "react";
import { client } from "./CustomAxios";
import { message } from "antd";



export const apis_MypageVideoLoad = async(user_data) => {
    return await client({
        url: `/profile/workspace/${user_data}`,
        method: "POST",
        responseType: 'json'
    }).then(response => {
        const files = []
        var obj = JSON.parse(response.data);
        for(var idx in obj){
            const byteCharacters = atob(obj[idx].data);
            const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
    
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
    
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            const blob = new Blob(byteArrays, { type: 'video/mp4' });

            // Blob 객체를 File 객체로 변환
            const file = new File([blob], (obj[idx].title+".mp4"), { type: 'video/mp4' });
            files.push(file);
        }
    
        return files;
    })
    .catch((err) => {
        switch(err.status_code){
            case 403:
                message.error(err["response"]["data"]["message"]);
            default:
                message.error(err["response"]["data"]["message"]);
        }
    })
}