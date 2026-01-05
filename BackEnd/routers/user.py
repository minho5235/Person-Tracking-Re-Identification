from fastapi import APIRouter,HTTPException, status, File
from fastapi.responses import JSONResponse
import bcrypt, sys, os, random, string

from email_auth import email_auth

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
import auth
from database import database, model, schema

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE_DIR = os.path.join(BASE_DIR, 'files/')

router_user = APIRouter(prefix='/user')

#ID 중복확인
@router_user.post("/join/{id}", tags=['user'])
def CheckId(id:str):
  try:
    database.GetUserNo(id)
    return JSONResponse(content={"messge" : "이미 존재하는 ID 입니다."}, status_code=status.HTTP_404_NOT_FOUND)
  except HTTPException as e:
    return JSONResponse(content={"message" : "사용 가능한 ID 입니다."}, status_code=status.HTTP_200_OK)
  except:
    return JSONResponse(content={"message" : "이미 존재하는 ID 입니다."}, status_code=404)

#이메일 인증
@router_user.post("/email/auth/{email}", tags=['user'])
def AuthEmail(email:str):
  try:
    strings = ""
    for i in range(10):
      strings += str(random.choice(string.ascii_uppercase))

    database.InsertEmailAuth(email,strings)

    email_auth.send_mail_join(email, strings)
    return JSONResponse(content={"messge" : "메일이 전송되었습니다"}, status_code=status.HTTP_200_OK)
  except HTTPException as e:
    return JSONResponse(content={"message" : "메일 전송에 실패했습니다."}, status_code=status.HTTP_404_NOT_FOUND)
  except:
    return JSONResponse(content={"message" : "메일 전송에 실패했습니다."}, status_code=404)
  
#이메일 인증 취소
@router_user.delete("/email/auth/{email}", tags=['user'])
def DeleteAuthEmail(email:str):
  try:
    database.DeleteEmailAuth(email=email)

    return JSONResponse(content={"messge" : "취소되었습니다."}, status_code=status.HTTP_200_OK)
  except HTTPException as e:
    return JSONResponse(content={"message" : "에러"}, status_code=status.HTTP_404_NOT_FOUND)
  except:
    return JSONResponse(content={"message" : "에러"}, status_code=404)


 #이메일 인증 확인 
@router_user.post("/email/auth/check/{email}/{code}", tags=['user'])
def DeleteAuthEmail(email:str, code:str):
  try:
    database.CheckEmailAuth(email,code)

    return JSONResponse(content={"messge" : "인증되었습니다."}, status_code=status.HTTP_200_OK)
  except HTTPException as e:
    return JSONResponse(content={"message" : e.detail}, status_code=status.HTTP_404_NOT_FOUND)
  except:
    return JSONResponse(content={"message" : "인증코드가 옳바르지 않습니다."}, status_code=404)
 
#회원가입
@router_user.post("/join",tags=['user'], status_code=status.HTTP_201_CREATED)
def UserJoin(data:schema.Member_Join):
  try:
    result:bool = database.Join(data)
    
    return JSONResponse(content={"message" : "회원가입 성공!"}, status_code=status.HTTP_201_CREATED)
  except HTTPException as e:
    return JSONResponse(content={"message" : e.detail}, status_code=e.status_code)
  except:
    return JSONResponse(content={"message" : "회원가입 실패!"}, status_code=status.HTTP_404_NOT_FOUND)


#로그인
@router_user.post("/login", tags=['user'] , status_code=status.HTTP_200_OK)
def UserLogin(data:schema.Member_Login):
  try:
    user_no:int = database.GetUserNo(data.id)
    
    get_name = database.session.query(model.profile).filter(model.profile.user_no == user_no).all()
    if(not get_name[0].email_auth):
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="이메일 인증 후 이용 가능힙니다." ) 

    result =  database.session.query(model.password).filter(model.password.user_no == user_no).all()

    pw_hashed = bytes(result[0].password,'utf-8')

    if (bcrypt.checkpw(data.password.encode("utf-8"),pw_hashed)):
      res= auth.JWTManager.create_token({"id":data.id})
      return JSONResponse( content={"message" : "로그인 성공!", "token": res, "name" : get_name[0].user_name }, status_code=status.HTTP_200_OK) 
    else:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="비밀번호가 일치하지 않습니다." ) 
  except HTTPException as e:
    return JSONResponse(content={"message": e.detail}, status_code= e.status_code)
  except:
    return JSONResponse(content={"message" : "로그인 실패."}, status_code=status.HTTP_404_NOT_FOUND)
  finally:
    # try문이 성공/실패해도 반드시 connection은 종료됨
    database.session.close()

#비밀번호 찾기
@router_user.post("/pw", tags=['user'], status_code=status.HTTP_200_OK)
def UserFindPw(data:schema.Member_LostPw):
  try:
    email = database.GetEmail(data.name, data.id)
    
    strings = ""
    for i in range(10):
      strings += str(random.choice(string.ascii_uppercase))

    database.ChangePw(data.id, strings)

    email_auth.send_mail_findPw(email, data.id, strings)

  except:
    return JSONResponse(content={"message" : "일치하는 사용자가 없습니다."}, status_code=status.HTTP_404_NOT_FOUND)

#비밀번호 변경
@router_user.post("/pw/change", tags=['user'], status_code=status.HTTP_200_OK)
def UserChangePw(data:schema.Member_ChangePw):
  try:
    database.ChangePw(data.id, data.new_password)

    return JSONResponse( content={"message" : "비밀번호가 변경되었습니다."}, status_code=status.HTTP_200_OK) 
  except:
    return JSONResponse(content={"message" : "비밀번호를 변경하지 못했습니다."}, status_code=status.HTTP_404_NOT_FOUND)