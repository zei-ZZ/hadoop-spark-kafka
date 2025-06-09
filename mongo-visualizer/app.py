from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)  # ✅ enable CORS on all routes

# Connect to the MongoDB service by container name (thanks to the shared Docker network)
client = MongoClient("mongodb://mongo:27017/")
db = client["test_db"]
collection = db["test_collection"]

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
