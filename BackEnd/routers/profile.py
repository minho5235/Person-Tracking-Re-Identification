import json
from fastapi import APIRouter,HTTPException, UploadFile, status, File, Request
from fastapi.responses import JSONResponse, Response, StreamingResponse, FileResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from auth import JWTManager
from typing import List

import sys, os, base64, uuid

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
import auth
from database import database

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE_DIR = os.path.join(BASE_DIR, 'files')

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router_profile = APIRouter(prefix='/profile')


#마이페이지/내정보
@router_profile.post("/", tags=['profile'], status_code= status.HTTP_200_OK)
def UserProfile(request:Request):
  try:
    user = JWTManager.decode_token(request.cookies["ACCESS_TOKEN"])
    user_no = database.GetUserNo(user["id"])
    profile = database.GetUserProfile(user_no)
    if profile.user_img != None:
      start_index = str(profile.user_img).find("'") + 1
      end_index = str(profile.user_img).find("'", start_index)
      extracted_string = str(profile.user_img)[start_index:end_index]
    else:
      extracted_string = None
    data = {
      "id" : user["id"],
      "email" : profile.email,
      "name" : profile.user_name,
      "img" : extracted_string
    }
    
    return JSONResponse(data, status_code=206)
  except HTTPException as e:
    return JSONResponse(content={"message": e.detail}, status_code= e.status_code)
  except:
    return JSONResponse(content={"message" : "사용자 정보를 얻어올 수 없습니다."}, status_code=status.HTTP_404_NOT_FOUND)

#유저 이미지 삭제
@router_profile.delete("/img", tags=['profile'], status_code=status.HTTP_200_OK)
def UserImgDelete(request:Request):
    try:
        user = auth.JWTManager.decode_token(request.cookies["ACCESS_TOKEN"])
        user_no:int = database.GetUserNo(user["id"])

        database.DeleteUserImg(user_no)

        return JSONResponse(content={"message" : "변경 사항이 저장되었습니다."}, status_code=status.HTTP_200_OK)
    except HTTPException as e:
        return JSONResponse(content={"message": e.detail}, status_code= e.status_code)
    except:  
        return JSONResponse(content={"message" : "저장에 실패했습니다."}, status_code=status.HTTP_404_NOT_FOUND)


#유저 이미지 업로드
@router_profile.post("/user-img", tags=['profile'], status_code=status.HTTP_200_OK)
def UserImgUpload(request:Request, file: UploadFile = File(...)):
  try:
    file_img = file.file.read()

    user = auth.JWTManager.decode_token(request.cookies["ACCESS_TOKEN"])
    user_no:int = database.GetUserNo(user["id"])

    database.SetUserImg(user_no, file_img)

    return JSONResponse(content={"message" : "변경 사항이 저장되었습니다."}, status_code=status.HTTP_200_OK)
  except HTTPException as e:
    return JSONResponse(content={"message": e.detail}, status_code= e.status_code)
  except:  
    return JSONResponse(content={"message" : "저장에 실패했습니다."}, status_code=status.HTTP_404_NOT_FOUND)


#유저 작업공간 보여주기
@router_profile.post("/workspace", tags=['profile'], status_code=status.HTTP_200_OK)
def UserWorkSpaceLoad(request:Request):
  try:
    user = auth.JWTManager.decode_token(request.cookies["ACCESS_TOKEN"])
    user_no:int = database.GetUserNo(user["id"])

    workspaces=database.GetUserWorkSpace(user_no)

    for temp in workspaces:
      uuid_dir_path = os.path.join(FILE_DIR, temp["workspace_path"])
      
      video_folders = [f for f in os.listdir(uuid_dir_path) if os.path.isdir(os.path.join(uuid_dir_path, f))] 
      for folder in video_folders:
        if folder != "result":
          Thumbnail_img_path = os.path.join(os.path.join(uuid_dir_path,folder), f"Thumbnail.jpg")
          break
      with open(Thumbnail_img_path, 'rb') as f:
        base64image = base64.b64encode(f.read()).decode()
        temp["ThumbnailImg"]=base64image

    return JSONResponse(workspaces, status_code=200)
  except HTTPException as e:
    return JSONResponse(content={"message": e.detail}, status_code= e.status_code)
  except:  
    return JSONResponse(content={"message" : "데이터를 불러오지 못했습니다."}, status_code=status.HTTP_404_NOT_FOUND)

#유저 작업공간 삭제
@router_profile.post("/workspace/{workspace_path}/{user_no}", tags=['profile'], status_code=status.HTTP_200_OK)
def UserWorkSpaceDelete(request:Request, workspace_path:uuid.UUID, user_no:str):
  try:  
    user = auth.JWTManager.decode_token(request.cookies["ACCESS_TOKEN"])
    
    result = database.DeleteUserWorkSpace(user_no, workspace_path)
    if result:
      return JSONResponse(content={"message": "삭제되었습니다."}, status_code=200)
    raise HTTPException(status_code=404, detail="삭제하지 못했습니다.")
  except HTTPException as e:
    return JSONResponse(content={"message": e.detail}, status_code= e.status_code)
  except:  
    return JSONResponse(content={"message" : "잘못된 workspace입니다."}, status_code=status.HTTP_404_NOT_FOUND)

#workspace 공간 클릭할때 해당 영상 반환
@router_profile.post("/workspace/{workspace_path}", tags=['profile'], status_code=status.HTTP_200_OK)
def GetWorkSpaceVideo(request:Request, workspace_path:uuid.UUID):
  try:  
    user = auth.JWTManager.decode_token(request.cookies["ACCESS_TOKEN"])
    
    user_no:int = database.GetUserNo(user["id"])

    workspaces=database.GetUserWorkSpace(user_no)

    for temp in workspaces:
      if str(workspace_path) == temp["workspace_path"]:
        uuid_dir_path = os.path.join(FILE_DIR, temp["workspace_path"])
        folders = [f for f in os.listdir(uuid_dir_path) if os.path.isdir(os.path.join(uuid_dir_path, f))]

        videos_byte = []
        for folder in folders:
          if folder != "result":
            folder_path = os.path.join(uuid_dir_path, folder)
            video_path =  os.path.join(folder_path, f"original.mp4")
            with open(video_path, "rb") as f:
              bytes = f.read()
              video_dict = {
                'title' : folder,
                'data' : base64.b64encode(bytes).decode('utf-8')
              }
              videos_byte.append(video_dict)
      
        json_data= json.dumps(videos_byte, ensure_ascii=False)
        return JSONResponse(content=json_data,media_type="application/json")
    
    #해당하는 workspace가 없는경우
    raise  HTTPException(status_code=404, detail="잘못된 workspace입니다.")
  except HTTPException as e:
    return JSONResponse(content={"message": e.detail}, status_code= e.status_code)
  except:  
    return JSONResponse(content={"message" : "잘못된 workspace입니다."}, status_code=status.HTTP_404_NOT_FOUND)


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

#사람의 json data 반환
@router_profile.post("/workspaceVd/{workspace_path}", tags=['profile'], status_code=status.HTTP_200_OK)
def GetWorkSpaceTimeLine(request:Request, workspace_path:uuid.UUID):
  try:  
    user = auth.JWTManager.decode_token(request.cookies["ACCESS_TOKEN"])

    editor_path = os.path.join(FILE_DIR, str(workspace_path))

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
    
    result = Result(id=str(workspace_path), people= result_persons, videos=result_videos)
  
    return result
  except HTTPException as e:
    return JSONResponse(content={"message": e.detail}, status_code= e.status_code)
  except:  
    return JSONResponse(content={"message" : "잘못된 workspace입니다."}, status_code=status.HTTP_404_NOT_FOUND)