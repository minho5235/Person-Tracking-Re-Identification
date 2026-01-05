import os, json, shutil,random, string
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Union
import requests
from fastapi.responses import JSONResponse,Response
import Module.perfect
from fastapi import  File, APIRouter, HTTPException,UploadFile
import cv2
import re
from datetime import datetime
import easyocr, base64


router_apis = APIRouter(tags=["apis"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE_DIR = os.path.join(BASE_DIR, 'files')

class Result_Person(BaseModel):
    person_name: str
    timeline_path: List[dict]
    face_img: List[str] = []

class Video(BaseModel):
    file_name: str
    People:List[Result_Person] = []
    thumbnail_img:str = None
    video_date:datetime=None

@router_apis.post('/video/test', description="비디오를 업로드합니다.")
def extract_video_date(img_path):
    cap = cv2.imread(img_path)
    gray_image = cv2.cvtColor(cap, cv2.COLOR_BGR2GRAY)

    reader = easyocr.Reader(['hi'], gpu=False)
    results = reader.readtext(gray_image)

    video_date_str = None
    video_time_str = None

    # 추출된 텍스트에서 날짜 및 시간 패턴 검색
    for (bbox, text, prob) in results:
        date_match = re.search(r'(\d{4}/\d{2}/\d{2})', text)
        time_match = re.search(r'(\d{2}:\d{2})', text)
        date_time_match = re.search(r'(\d{4}/\d{2}/\d{2} \d{2}:\d{2})', text)
        
        if date_match:
            video_date_str = date_match.group(1)
        elif time_match:
            video_time_str = time_match.group(1)
        elif date_time_match:
            video_time_str = date_time_match.group(1)

    if video_date_str and video_time_str:
        video_datetime_str = f"{video_date_str} {video_time_str}"
        video_datetime = datetime.strptime(video_datetime_str, "%Y/%m/%d %H:%M")
        return video_datetime
    elif date_time_match:
        video_date = datetime.strptime(video_date_str, "%Y/%m/%d %H:%M")
        return video_date
    else:
        print("날짜 또는 시간 정보를 찾을 수 없습니다.")
        return None

@router_apis.post('/video', description="비디오를 업로드합니다.")
def create_video_file(files : UploadFile= File(...), fileName :str = File(...)):
    try:

        #폴더 생성 및 생성된 폴더로 경로 지정
        new_video = Video( file_name=fileName)
        id_path = os.path.join(FILE_DIR, str(random.choice(string.ascii_uppercase)))  
        os.makedirs(id_path)   
        video_path = os.path.join(id_path, new_video.file_name)

        # #생성된 폴더에 전달받은 영상 저장
        with open(video_path, 'wb') as buffer:
           shutil.copyfileobj(files.file, buffer)

        #얼굴 이미지 저장 및 저장 경로 파일 생성
        ########################################
        Module.perfect.process_people_and_save_images(video_path, id_path)
        ########################################
            
        #썸네일 저장
        with open(os.path.join(id_path,"thumbnail.jpg"), "rb") as img:
            new_video.thumbnail_img = base64.b64encode(img.read())
            
        # 동영상 시간 추출
        new_video.video_date = extract_video_date(os.path.join(id_path,"thumbnail.jpg"))

        #탐지 인물 폴더 가져오기
        folders = [f for f in os.listdir(id_path) if os.path.isdir(os.path.join(id_path, f))]
        for folder in folders:
            folder_path = os.path.join(id_path,folder)
            timeline_path =os.path.join(folder_path, "data.json")

            #인물의 시간이 담긴 json파일 열어서 new_video에 저장
            with open(timeline_path, "r", encoding="utf-8") as json_file:
                video_json_file = json.load(json_file)
                images = []
                for filename in os.listdir(folder_path):
                    # 파일의 확장자가 이미지인지 확인
                    if filename.lower().endswith(('.jpg')):
                        image_path = os.path.join(folder_path, filename)
                        # 이미지 파일을 열고 데이터를 읽어들임
                        with open(image_path, 'rb') as f:
                            image_data = base64.b64encode(f.read())
                        # 이미지 데이터를 ResultPerson 객체로 생성하여 리스트에 추가
                        images.append(image_data)

                person = Result_Person(
                    person_name=folder,
                    timeline_path=video_json_file,
                    face_img=images
                )
                new_video.People.append(person)  
        
        return new_video
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"message" : e.detail}
        )
    except Exception as e:
        return JSONResponse(
            status_code=422,
            content={"message" : "{new_video.file_name}_잠시후 다시 시도해주세요."}
        )    
    finally:
        shutil.rmtree(id_path)