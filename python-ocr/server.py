import base64
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import easyocr

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading EasyOCR model...")
reader = easyocr.Reader(['en'], gpu=False)
print("Model loaded successfully!")

class CaptchaRequest(BaseModel):
    imageBase64: str

@app.post("/solve")
async def solve_captcha(data: CaptchaRequest):
    try:
        # 1. Decode base64 image
        img_data = data.imageBase64
        if "," in img_data:
            img_data = img_data.split(",")[1]
            
        image_bytes = base64.b64decode(img_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image data")

        # 2. Balanced Preprocessing (Safe for letter strokes)
        # A. Upscale 2x for clarity
        img_resized = cv2.resize(img, (0, 0), fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)

        # B. Convert to grayscale
        gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

        # C. Bilateral Filter: Smooths background noise/grids while keeping sharp text borders intact
        filtered = cv2.bilateralFilter(gray, 11, 17, 17)

        # D. Otsu's Thresholding for high-contrast black text on white background
        _, processed = cv2.threshold(filtered, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # 3. Run EasyOCR with allowlist containing both lowercase AND uppercase letters + numbers
        results = reader.readtext(
            processed, 
            allowlist="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            detail=1
        )
        
        # Sort characters precisely from left to right based on X coordinates
        results = sorted(results, key=lambda r: r[0][0][0])
        
        raw_text = "".join([res[1] for res in results])
        
        # Keep alphanumeric and force everything to UPPERCASE for the final form value
        cleaned_text = "".join(filter(str.isalnum, raw_text)).upper()
        
        if len(cleaned_text) > 6:
            cleaned_text = cleaned_text[:6]

        print(f"Solved Captcha: {cleaned_text} (Raw: {raw_text})")
        return {"success": True, "text": cleaned_text}

    except Exception as e:
        print(f"OCR Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)