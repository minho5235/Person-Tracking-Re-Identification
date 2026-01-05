import jwt, os
from datetime import datetime, timedelta
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM =  os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = float(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
                

class JWTManager:
    @staticmethod
    def create_token(data: dict):
        data_to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        data_to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(data_to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_token(token: str):
        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return {"result":"success", "id":decoded_token.get("id")}
        except jwt.ExpiredSignatureError:
            raise  HTTPException(status_code=403  , detail="만료된 사용자입니다. 다시 로그인해주세요")
            # 토큰이 만료된 경우 처리
        except jwt.InvalidSignatureError:
            raise  HTTPException(status_code=403, detail="유효하지않은 접근입니다")
            # 토큰의 서명이 유효하지 않은 경우 처리
        except jwt.DecodeError:
            raise  HTTPException(status_code=403, detail="유효하지않은 접근입니다")
            # 토큰의 디코딩에 실패한 경우 처리
        except:
            # 그 외 예외 처리
            raise HTTPException(status_code=403, detail="유효하지않은 접근입니다.")
        
