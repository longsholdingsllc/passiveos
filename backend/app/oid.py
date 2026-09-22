"""ObjectId that works with Mongo (bson) or file DB."""
import os

USE_FILE = os.getenv("USE_FILE_DB", "1").lower() in ("1", "true", "yes")

if USE_FILE:
    from app.file_db import ObjectId
else:
    try:
        from bson import ObjectId  # type: ignore
    except ImportError:
        from app.file_db import ObjectId

__all__ = ["ObjectId"]
