from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings


class Database:
    client: AsyncIOMotorClient = None
    database = None


db = Database()


async def get_database():
    return db.database


async def connect_to_mongo():
    """Create database connection"""
    db.client = AsyncIOMotorClient(settings.mongodb_url)
    db.database = db.client[settings.database_name]
    
    # Create indexes
    await db.database.users.create_index("email", unique=True)
    await db.database.users.create_index("username", unique=True)
    await db.database.documents.create_index("user_id")


async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
