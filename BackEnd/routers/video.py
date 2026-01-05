from lib2to3.pgen2.token import OP
from fastapi import  File, UploadFile, APIRouter, HTTPException, Request
from concurrent.futures import ThreadPoolExecutor

import os, json, base64, cv2, shutil, requests
from moviepy.editor import *
from typing import List
from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from fastapi.responses import JSONResponse, FileResponse

from auth import JWTManager
from database import database, model

import Module.person
from Module.person import Person
import face_recognition
import numpy as np

router_video = APIRouter(tags=["video"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE_DIR = os.path.join(BASE_DIR, 'files')

APISERVER_URL = [
    "http://10.101.177.196:8888/video",
    "http://10.101.192.222:8888/video",
    "http://10.101.68.94:8888/video"
]
    
class Result_Person(BaseModel):
    person_name: str
    timeline_path: List[dict]
    face_img: List[str] = []

class Video(BaseModel):
    file_name: str
    People:List[Result_Person] = []
    thumbnail_img:str = None
    video_date:datetime = None

class Editor(BaseModel):
    id: UUID= Field(default_factory=uuid4)
    title :str
    videos: List[Video] = []
    created_at : datetime = datetime.now()

class Result_Person(BaseModel):
    name: str
    faceImg :str
    timeline_path: List[dict]

class Result_video(BaseModel):
    title: str
    time:str

class Result(BaseModel):
    id:str
    people: List[Result_Person]
    videos: List[Result_video]    

def post_url(args):
    res = requests.post(url=args[0], files= {"files": args[1].file}, data={"fileName":args[1].filename})
    json_data = res.json()
    result:Video = json_data
    return result

def calculate_people(loc, people):
    index = []
    if loc+1 >= len(people):
        return people
    for i in range(loc+1, len(people)):
        person_avg1 = people[loc].calculate_average_encoding()
        person_avg2 = people[i].calculate_average_encoding()
        distance = face_recognition.face_distance([person_avg1], person_avg2)
        if distance[0] <= 0.38:
            index.append(i)
            people[loc].faces.extend(people[i].faces)
            people[loc].face_image.extend(people[i].face_image)
            data = people[i].exist[0]
            people[loc].exist.append(data)
    for i in reversed(index):
        people.pop(i)
    people = calculate_people(loc+1, people)
    return people


@router_video.post("/upload-video/uuid", description="비디오를 업로드합니다.")
async def create_video_file(request:Request,title:str = File(...), files: List[UploadFile ] = File(...)):
    try:
        user = JWTManager.decode_token(request.cookies["ACCESS_TOKEN"])
        user_no = database.GetUserNo(user["id"])
        
        editor = Editor(title=title)

        #@@@@@@@@@@ editor_path == 전체 폴더 {ex: 2e3d920a-8419-4998-a378-4f049e1a9c60}
        editor_path = os.path.join(FILE_DIR, str(editor.id))
        os.makedirs(editor_path)

        list_of_urls = []
        
        idx = 0
        for file in files:
            temp = (APISERVER_URL[idx],file)
            list_of_urls.append(temp)
            idx += 1

        #동시에 요청 보내기
        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(post_url,list_of_urls))

        #분석 결과 append
        for response in responses:
            editor.videos.append(response)

        #분석결과 로컬 저장
        for videoClass in editor.videos:
            # @@@@@@@ videoFolder_path == 영상별 폴더 생성 (ex: 거실 부엌 복도)
            videoFolder_name = os.path.splitext(videoClass['file_name'])[0]
            videoFolder_path = os.path.join(editor_path, videoFolder_name)
            os.makedirs(videoFolder_path)

            #원본영상 저장 == originVd_path
            for file in files:
                if(file.filename == videoClass['file_name']):
                    originVd_path = os.path.join(videoFolder_path,('original.mp4'))
                    with open(originVd_path, 'wb+') as buffer:
                        file.file.seek(0) 
                        shutil.copyfileobj(file.file, buffer)
                    break

            #썸네일 저장
            thumbnail_path = os.path.join(videoFolder_path, "Thumbnail.jpg")
            with open(thumbnail_path, "wb") as f:
                imgdata = base64.b64decode(videoClass['thumbnail_img'])
                f.write(imgdata)

            #영상 시간 저장
            datetime_path = os.path.join(videoFolder_path, "datetime.txt")
            datetime_object = datetime.strptime(videoClass['video_date'], "%Y-%m-%dT%H:%M:%S")
            date_txt = datetime_object.strftime("%Y/%m/%d %H:%M:%S")
            with open(datetime_path, "w") as f:
                f.write(date_txt)

            for person in videoClass['People']:
                #@@@@@@@@@ personfolder_path == 검출된 사람 폴더  ()
                personfolder_path = os.path.join(videoFolder_path,person['person_name'])
                os.makedirs(personfolder_path)
                timeline_path =os.path.join(personfolder_path, "data.json")
                with open(timeline_path, "w")as oufile:
                    json.dump(person['timeline_path'], oufile)

                #사람 이미지 저장
                idx = 1
                for img in person['face_img']:
                    personImg_path = os.path.join(personfolder_path, str(person['person_name']+str(idx)+".jpg"))
                    with open(personImg_path, "wb") as f:
                        imgdata = base64.b64decode(img)
                        f.write(imgdata)
                    idx += 1

        peoples = []
        count_peoples = 0
        for videoClass in editor.videos:
            videoFolder_name = os.path.splitext(videoClass['file_name'])[0]
            videoFolder_path = os.path.join(editor_path, os.path.splitext(videoClass['file_name'])[0])
            people = []
            for person in videoClass['People']:
                personfolder_path = os.path.join(videoFolder_path,person['person_name'])
                timeline_path =os.path.join(personfolder_path, "data.json")
                with open(timeline_path, 'r') as file:
                    json_data = json.load(file)
                new_person = Person()
                for personImg in person['face_img']:
                    #base64 형태 이미지를 cv2 이미지 형태로 변환
                    decoded_image_data = base64.b64decode(personImg)
                    image_array = np.frombuffer(decoded_image_data, dtype=np.uint8)
                    img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
                    new_person.person.append(img)
                new_person.video = str(videoFolder_name)
                name = person['person_name'].split("_")[1]
                new_person.namelist.append(name)
                data = { "title" : new_person.video, "timeline" : json_data }
                new_person.exist.append(data)
                
                people.append(new_person)

            peoples.append(people)
            count_peoples += 1

        real_people = []
        noface_people = []

        for people in peoples:
            for person in people:
                if "noface" in person.namelist[0] :
                    noface_people.append(person)
                    continue
                else:
                    apdps = True
                    for real_person in real_people:
                        existname = real_person.namelist[0]
                        newname = person.namelist[0]
                        if existname == newname:
                            real_person.person.extend(person.person)
                            data = person.exist[0]
                            real_person.exist.append(data)
                            apdps = False
                            break
                    if apdps:
                        for person_image in person.person:
                            rgb_small_frame = np.ascontiguousarray(person_image[:, :, ::-1])
                            face_locations = face_recognition.face_locations(rgb_small_frame)
                            face_encoding_result = face_recognition.face_encodings(rgb_small_frame, face_locations)
                            if len(face_encoding_result) == 1:
                                top, right, bottom, left = face_locations[0]
                                face_image = person_image[top:bottom, left:right]
                                face_encoding = face_encoding_result[0]
                                person.faces.append(face_encoding)
                                person.add_face_image(face_image)
                        real_people.append(person)
        
        for noface_person in noface_people:
            for person_image in noface_person.person:
                rgb_small_frame = np.ascontiguousarray(person_image[:, :, ::-1])
                face_locations = face_recognition.face_locations(rgb_small_frame)
                face_encoding_result = face_recognition.face_encodings(rgb_small_frame, face_locations)
                if len(face_encoding_result) == 1:
                    top, right, bottom, left = face_locations[0]
                    face_image = person_image[top:bottom, left:right]
                    face_encoding = face_encoding_result[0]
                    noface_person.faces.append(face_encoding)
                    noface_person.add_face_image(face_image)
        
        noface_image_people = [noface_person for noface_person in noface_people if noface_person.calculate_average_encoding() is None]
        noface_people = [noface_person for noface_person in noface_people if noface_person.calculate_average_encoding() is not None]
        noface_people = calculate_people(0, noface_people)

        real_people.extend(noface_people)
        real_people.extend(noface_image_people)
        real_path = os.path.join(editor_path, "result")

        os.makedirs(real_path)
        people_c = 0
        for real_person in real_people:
            person_path = real_path + f"\\{people_c}_" + real_person.namelist[0]
            os.makedirs(person_path)
            with open(os.path.join(person_path,"data.json"), "w", encoding='UTF-8-sig') as json_file:
                json_file.write(json.dumps(real_person.exist, ensure_ascii=False))
            sharpest_image = Module.person.find_sharpest_image(real_person.face_image)[0][0]
            cv2.imwrite(f'{person_path}\\{real_person.namelist[0]}.jpg', sharpest_image)
            people_c += 1

        #분석 결과 가져오기
        result_path = os.path.join(editor_path, "result")
        person_folders = [f for f in os.listdir(result_path) if os.path.isdir(os.path.join(result_path, f))] 
        result_persons = []
        for folder in person_folders:
            folder_path = os.path.join(result_path, folder)
            img_path = os.path.join(folder_path, str(folder.split("_")[1]+ ".jpg"))
            timeline_path = os.path.join(folder_path, "data.json")
            with open(img_path, 'rb') as f:
                base64image = base64.b64encode(f.read()).decode()
            with open(timeline_path, "r",encoding='utf-8-sig') as json_file:
                video_json_file = json.load(json_file)
            result_person = Result_Person(
                name= folder, faceImg=base64image, timeline_path=video_json_file)
            result_persons.append(result_person)
        
        result_videos = []
        video_folders = [f for f in os.listdir(editor_path) if os.path.isdir(os.path.join(editor_path, f))] 
        for folder in video_folders:
            if folder != "result":
                videotime_path = os.path.join(os.path.join(editor_path,folder), "datetime.txt")
                with open(videotime_path, 'r') as f:
                    videoTime = f.read()
                result_person = Result_video( title= folder, time=videoTime)
                result_videos.append(result_person)
        result = Result(id=str(editor.id), people= result_persons, videos=result_videos)
        
        title_temp = title
        path_temp = editor.id
        date_temp = editor.created_at.strftime("%Y-%m-%d %H:%M:%S")
        try:
            database.session.add(model.workspace(
                user_no = user_no,
                workspace_title = title_temp,
                workspace_path =  path_temp,
                update_date = date_temp
            ))
            database.session.commit()
        except:
            database.session.rollback()
            raise HTTPException(status_code=404, detail="잠시후 다시 시도해주세요.")

        finally:
            database.session.close()

        return result
    except HTTPException as e:
        shutil.rmtree(editor_path)
        return JSONResponse(
            status_code=e.status_code,
            content={"message" : e.detail}
        )
    except Exception as e:
        shutil.rmtree(editor_path)
        return JSONResponse(
            status_code=404,
            content={"message" : "잠시후 다시 시도해주세요."}
        )    


class shortsVideo(BaseModel):
    id: UUID
    title: str
    name:str
    idx:int

@router_video.post("/download-video", description="선택한 인물의 숏폼을 다운로드 합니다.")
async def download_video(data:shortsVideo):
    try:
        clipVideo_path = None  # 초기화

        id_path = os.path.join(FILE_DIR, str(data.id))
        folder_path = os.path.join(id_path,data.title)
        result_folder_path = os.path.join(id_path, "result")
        name_path = os.path.join(result_folder_path,data.name)
        # 새로운 비디오 파일 생성
        output_video = str(data.name+"_"+data.title+"_"+str(data.idx)) + '.mp4'
        clipVideo_path = os.path.join(name_path,output_video)
        if not os.path.exists(clipVideo_path):
            # 비디오 파일 경로 직접 설정
            video_path = os.path.join(folder_path, f"original.mp4")
            
            #timeline json 파일 경로 설정
            timeline_path =os.path.join(name_path, "data.json")
            with open(timeline_path, "r", encoding='utf-8-sig') as json_file:
                video_json_file = json.load(json_file)

                for datas in video_json_file:
                    if datas["title"] == data.title:
                        start_sec  = int(datas["timeline"][data.idx]["start"]) 
                        end_sec   = int(datas["timeline"][data.idx]["end"]) 
                        break


        
                #MoviePy 를 사용한 동영상 저장
                clip = VideoFileClip(video_path)
                clip = clip.subclip(start_sec, end_sec)
                clip.write_videofile(clipVideo_path, fps=30, threads=30, codec="libx264" )

        return FileResponse(path=clipVideo_path,  media_type="video/mp4")
    except Exception as a:
        JSONResponse(content={"message":"해당 영상을 추출할 수 없습니다"}, status_code=404)
