from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # ✅ enable CORS on all routes

# Get MongoDB URI from environment variable
mongo_uri = os.getenv('MONGODB_URI')
if not mongo_uri:
    raise ValueError("MONGODB_URI environment variable is not set")

# Connect to MongoDB using the cloud URI
client = MongoClient(mongo_uri)
db = client["disasterDB"]
collection = db["anomalies"]

@app.route("/")
def index():
    return "Mongo Visualizer is running."

@app.route("/add", methods=["POST"])
def add_document():
    data = request.get_json()
    result = collection.insert_one(data)
    return jsonify({"inserted_id": str(result.inserted_id)}), 201

@app.route("/data", methods=["GET"])
def get_data():
    data = list(collection.find({}, {"_id": 0}))
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
