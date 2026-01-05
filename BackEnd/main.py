from fastapi import  FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

import uvicorn

from routers.user import router_user
from routers.video import router_video
from routers.profile import router_profile
from auth import *
from database.database import *
from middlewares.token_validator import access_control

app = FastAPI()

app.include_router(router_user)
app.include_router(router_video)
app.include_router(router_profile)

origins = [
    "http://10.101.118.108:3000"
]


app.add_middleware(middleware_class=BaseHTTPMiddleware, dispatch=access_control)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"])


if __name__ == "__main__": 
    uvicorn.run(app, host="10.101.118.108", port=8000)
