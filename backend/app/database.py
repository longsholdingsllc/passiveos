import os
from typing import Any, Optional

USE_FILE_DB = os.getenv("USE_FILE_DB", "1").lower() in ("1", "true", "yes")

client: Any = None
db: Any = None
_using_file = False


async def connect_db():
    global client, db, _using_file
    if USE_FILE_DB:
        from app.file_db import get_file_db
        db = get_file_db()
        _using_file = True
        print("Using file-backed database (backend/data/) — no MongoDB required")
        return

    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        from app.config import get_settings
        settings = get_settings()
        client = AsyncIOMotorClient(settings.mongo_url, serverSelectionTimeoutMS=2000)
        await client.admin.command("ping")
        db = client[settings.database_name]
        await db.users.create_index("email", unique=True)
        await db.streams.create_index([("user_id", 1)])
        await db.entries.create_index([("stream_id", 1), ("date", -1)])
        await db.goals.create_index([("user_id", 1)])
        await db.chat_sessions.create_index([("user_id", 1)])
        await db.messages.create_index([("session_id", 1), ("created_at", 1)])
        _using_file = False
        print(f"Connected to MongoDB: {settings.database_name}")
    except Exception as e:
        print(f"MongoDB unavailable ({e}) — falling back to file DB")
        from app.file_db import get_file_db
        db = get_file_db()
        _using_file = True


async def close_db():
    global client
    if client is not None:
        client.close()
        print("MongoDB connection closed")


def get_db():
    if db is None:
        raise RuntimeError("Database not connected")
    return db


def using_file_db() -> bool:
    return _using_file
