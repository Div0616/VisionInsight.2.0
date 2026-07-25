import os

# Create required folders on startup
os.makedirs("uploads", exist_ok=True)
os.makedirs("processed", exist_ok=True)
print("Folders created: uploads/ and processed/")