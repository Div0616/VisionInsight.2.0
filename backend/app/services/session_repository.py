from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from app.core.database import get_database
from app.models.session import VideoSession, SessionStatus, AnalyticsSummary

COLLECTION = "sessions"


def _serialize(doc: dict) -> dict:
    """Convert MongoDB _id to string."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc




async def create_session(session: VideoSession) -> dict:
    """Insert a new session document."""
    db = get_database()
    doc = session.model_dump()
    doc["_id"] = session.session_id
    await db[COLLECTION].insert_one(doc)
    return _serialize(doc)


async def get_session(session_id: str) -> Optional[dict]:
    """Find session by session_id."""
    db = get_database()
    doc = await db[COLLECTION].find_one({"session_id": session_id})
    return _serialize(doc) if doc else None


async def update_status(
    session_id: str,
    status: SessionStatus,
    progress: float = None,
    error: str = None
):
    """Update session status and progress."""
    db = get_database()
    update = {
        "status": status,
        "updated_at": datetime.now(timezone.utc)
    }
    if progress is not None:
        update["progress"] = progress
    if error is not None:
        update["error"] = error

    await db[COLLECTION].update_one(
        {"session_id": session_id},
        {"$set": update}
    )


async def update_analytics(session_id: str, analytics: dict):
    """Save analytics results and mark session completed."""
    db = get_database()
    await db[COLLECTION].update_one(
        {"session_id": session_id},
        {"$set": {
            "analytics": analytics,
            "status": SessionStatus.COMPLETED,
            "progress": 100.0,
            "updated_at": datetime.now(timezone.utc)
        }}
    )


async def list_sessions() -> list[dict]:
    """Return all sessions, newest first."""
    db = get_database()
    cursor = db[COLLECTION].find().sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [_serialize(doc) for doc in docs]