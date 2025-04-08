## 🛠️ Getting Started

### 🔧 Backend Setup (FastAPI + Whisper)

```bash
# 1. Navigate to backend
cd ai-backend

# 2. (Optional but recommended) Create and activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# 3. Install required packages
pip install -r requirements.txt

# 4. Start the server
uvicorn main:app --reload
The server will be available at: http://127.0.0.1:8000

### Frontend
# 1. Navigate to frontend
cd ai-frontend

# 2. Install dependencies
npm install

# 3. Start the React app
npm start