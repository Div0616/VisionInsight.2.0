from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    
db = Database()

async def connect_db():
    """Create database connection on app startup."""
    db.client = AsyncIOMotorClient(settings.MONGODB_URI)
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")

async def close_db():
    """Close database connection on app shutdown."""
    if db.client:
        db.client.close()
        print("MongoDB connection closed")

def get_database():
    """Return database instance."""
    if db.client is None:
        raise RuntimeError("Database not connected. Ensure connect_db() was called on startup.")
    return db.client[settings.DATABASE_NAME]