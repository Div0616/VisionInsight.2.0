import requests

url = "http://localhost:8000/api/upload"
file_path = r"C:\Users\divya\Downloads\12821988_1080_1920_30fps.mp4"

with open(file_path, "rb") as f:
    response = requests.post(url, files={"file": (file_path, f, "video/mp4")})

print("Status:", response.status_code)
print("Response:", response.json())