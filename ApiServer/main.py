from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import uvicorn
import Module.perfect

from routers.apis import router_apis
app = FastAPI()

app.include_router(router_apis)

origins = [
    "http://10.101.65.247:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"])


if __name__ == "__main__":
    Module.perfect.load_images_and_encodings()
    uvicorn.run(app, host="10.101.177.196", port=8888)
        