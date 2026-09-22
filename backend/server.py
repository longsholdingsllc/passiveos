from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import connect_db, close_db
from app.routers import auth, streams, dashboard, goals, ai, coach

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Passive Income Autopilot API",
    description="Full-featured passive income platform with AI generators, coaching, DCA simulator, and stream tracking.",
    version="1.0.0",
    lifespan=lifespan,
)

raw = (settings.cors_origins or "*").strip()
if raw == "*":
    origins = ["*"]
    allow_credentials = False
else:
    origins = [o.strip() for o in raw.split(",") if o.strip()] or ["*"]
    allow_credentials = True
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(streams.router)
app.include_router(dashboard.router)
app.include_router(goals.router)
app.include_router(ai.router)
app.include_router(coach.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "passive-income-autopilot"}
