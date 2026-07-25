import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.core.config import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_video(file_path: str, public_id: str) -> str:
    """
    Upload raw video to Cloudinary
    Returns the secure URL of the uploaded video
    """
    result = cloudinary.uploader.upload(
        file_path,
        public_id=f"visioninsight/uploads/{public_id}",
        resource_type="video",
        overwrite=True
    )
    return result["secure_url"]

def upload_processed_video(file_path: str, public_id: str) -> str:
    """
    Upload annotated output video to Cloudinary
    Returns the secure URL of the processed video
    """
    result = cloudinary.uploader.upload(
        file_path,
        public_id=f"visioninsight/processed/{public_id}",
        resource_type="video",
        overwrite=True
    )
    return result["secure_url"]

def delete_video(public_id: str) -> bool:
    """
    Delete a video from Cloudinary
    """
    try:
        cloudinary.uploader.destroy(
            public_id,
            resource_type="video"
        )
        return True
    except:
        return False