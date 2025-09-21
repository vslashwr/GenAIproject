import json
from fastapi import FastAPI, File, UploadFile
from pydanticmodels.input import Chatbody
from services.gemini import GeminiService
from fastapi.middleware.cors import CORSMiddleware




app = FastAPI()
gemini_service = GeminiService()


# Enable CORS for Flutter web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.post("/dashboard")
async def respo(body: Chatbody):
    jso = gemini_service.get_response(f"{body.query}")
    print()
    # text = json.dumps(jso, indent=4)
    print(jso)
    return jso

@app.post("/qna")
async def respo(body: Chatbody):
    ans = gemini_service.get_answer(f"{body.query}")
    # text = json.dumps(jso, indent=4)
    print(ans)
    return ans

@app.post("/pdf")
async def respo(file: UploadFile = File(...)) :
    ans = await gemini_service.Getfromdoc(file)
    # text = json.dumps(ans, indent=4)
    # print(text)
    return ans

# Required for Vercel
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)