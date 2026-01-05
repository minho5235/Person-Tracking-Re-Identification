from fastapi import HTTPException
from fastapi.responses import JSONResponse
from starlette.requests import Request
from auth import JWTManager


async def access_control(request: Request, call_next):
    try:
        token =request.cookies.get("ACCESS_TOKEN")

        if(token):
            request.state.inspect = None
            request.state.user = None
            request.state.service = None

            ip = request.headers["x-forwarded-for"] if "x-forwarded-for" in request.headers.keys() else request.client.host
            request.state.ip = ip.split(",")[0] if "," in ip else ip
            headers = request.headers

            url = request.url.path

            JWTManager.decode_token(token)
            
            return await call_next(request)

            
        elif "/user" in request.url.path:
            return await call_next(request)
        else:
            raise  HTTPException(status_code=404, detail="옳바르지 않은 접근입니다.")
    except HTTPException as e:
        return JSONResponse(content={"message": e.detail}, status_code= e.status_code)
    except Exception as e:
        return JSONResponse(content={"message" : "잠시후 다시 시도해주세요."}, status_code=400)


        




