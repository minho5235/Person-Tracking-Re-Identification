# 📹 CCTV 기반 인물 동선 추적 및 검색 솔루션 (Person Tracking & Re-Identification)

> **우송대학교 비트교육센터 고급과정 38기 4조 프로젝트** > **개발 기간:** 2024.11 ~ (진행 기간 기입)

<br>

## 📖 프로젝트 개요
이 프로젝트는 건물 내 여러 CCTV 영상(강의실, 복도, 엘리베이터 등)을 분석하여 **특정 인물의 이동 경로와 출현 시간을 자동으로 타임라인화**하는 AI 웹 솔루션입니다.
기존 수작업으로 이루어지던 CCTV 관제 업무를 자동화하여, 특정 인물이 **'언제', '어디서', '어디로'** 이동했는지 시각적으로 제공합니다.

<br>

## 💡 주요 기능 (Key Features)

### 1. 🔍 AI 기반 인물 탐지 및 추적 (Detection & Tracking)
- **YOLOv7**을 사용하여 영상 내 사람 객체를 실시간으로 탐지합니다.
- **SORT (Simple Online and Realtime Tracking)** 알고리즘을 적용하여, 프레임 간 인물이 겹치거나 가려져도 ID를 유지하며 추적합니다.

### 2. 👤 얼굴 인식 및 신원 확인 (Face Re-Identification)
- 추적된 인물의 얼굴을 **Face Recognition (dlib)** 라이브러리로 임베딩(Vector화)하여 DB에 저장된 인물과 대조합니다.
- 코사인 유사도(Cosine Similarity)를 통해 동일 인물을 판별하고 분류합니다.

### 3. 🗺️ 장소별 동선 시각화 (Floor Plan Visualization)
- 웹 대시보드에서 건물 도면(Map)을 제공하며, 특정 인물을 선택하면 **강의실 → 복도 → 엘리베이터** 순서의 이동 동선을 하이라이트합니다.
- **EasyOCR**을 활용하여 CCTV 영상 내의 실제 시간(Timestamp)을 텍스트로 추출, 정확한 출현 시각을 기록합니다.

### 4. 📊 타임라인 및 영상 검색
- 분석 결과는 타임라인(Timeline) 형태로 제공됩니다.
- 타임라인의 특정 구간을 클릭하면, 해당 인물이 등장한 순간의 **하이라이트 영상 클립**을 즉시 재생합니다.

<br>

## 🛠 기술 스택 (Tech Stack)

### **Frontend**
<img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=React&logoColor=black"/> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=JavaScript&logoColor=black"/>

### **Backend**
<img src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=Python&logoColor=white"/> <img src="https://img.shields.io/badge/FastAPI-009688?style=flat&logo=FastAPI&logoColor=white"/>

### **AI & Data Processing**
<img src="https://img.shields.io/badge/YOLOv7-00FFFF?style=flat&logo=Yolo&logoColor=black"/> <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=flat&logo=PyTorch&logoColor=white"/> <img src="https://img.shields.io/badge/OpenCV-5C3EE8?style=flat&logo=OpenCV&logoColor=white"/> <img src="https://img.shields.io/badge/Face_Recognition-008000?style=flat&logoColor=white"/> <img src="https://img.shields.io/badge/EasyOCR-FFA500?style=flat&logoColor=white"/>

<br>

## 🏗️ 시스템 아키텍처 (System Flow)

1.  **Video Upload:** 사용자가 웹에서 CCTV 영상을 업로드합니다.
2.  **Preprocessing:** 서버에서 영상을 프레임 단위로 분할하고 EasyOCR로 촬영 시각을 분석합니다.
3.  **Detection (YOLOv7):** 각 프레임에서 사람(Person) 객체를 탐지합니다.
4.  **Tracking (SORT):** 탐지된 객체의 이동 경로를 추적하여 ID를 부여합니다.
5.  **Identification:** 얼굴이 선명하게 나온 프레임을 추출하여 기존 데이터와 매칭(Clustering)합니다.
6.  **Result Generation:** 분석된 데이터를 JSON 형태로 가공하여 프론트엔드로 전송합니다.

<br>

## 🖥️ 실행 화면

| 로그인 화면 | 대시보드 & 업로드 |
| :---: | :---: |
| *(로그인 화면 캡처)* | *(업로드 화면 캡처)* |
| **인물 선택 및 맵 뷰** | **타임라인별 영상 재생** |
| *(도면 및 인물 선택 화면)* | *(결과 영상 재생 화면)* |

> *영상을 분석하여 특정 인물(예: 박종원, 한민호 등)을 선택하면 해당 인물이 등장한 구간만 필터링됩니다.*

<br>

## 🔧 설치 및 실행 방법 (Installation)

### Backend
```bash
# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 라이브러리 설치 (YOLO 및 Torch 관련 의존성 포함)
pip install -r requirements.txt

# 서버 실행 (FastAPI)
uvicorn main:app --reload