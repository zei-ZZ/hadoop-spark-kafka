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


# @app.route("/")
# def index():
#     return "Mongo Visualizer is running."

# @app.route("/add", methods=["POST"])
# def add_document():
#     data = request.get_json()
#     result = collection.insert_one(data)
#     return jsonify({"inserted_id": str(result.inserted_id)}), 201

# @app.route("/data", methods=["GET"])
# def get_data():
#     data = list(collection.find({}, {"_id": 0}))
#     return jsonify(data)

@app.route("/anomalies", methods=["GET"])
def get_anomalies():
    collection = db["anomalies"]
    # Define allowed filter fields and their types
    filter_fields = {
        "country": "Country",
        "disaster_type": "Disaster Type",
        "event_name": "Event Name",
        "start_year": "Start Year",
        "magnitude": "Magnitude",
        "total_deaths": "Total Deaths",
        "total_affected": "Total Affected",
    }
    
    # Build MongoDB filter from query params
    query = {}
    for param, field in filter_fields.items():
        arg = request.args.get(param)
        if arg is not None:
            try:
                if field == "Start Year":
                    query[field] = int(arg)
                elif field in ["Magnitude", "Total Deaths", "Total Affected"]:
                    query[field] = float(arg)
                else:
                    # Use case-insensitive regex for text fields
                    query[field] = {"$regex": arg, "$options": "i"}
            except ValueError:
                return jsonify({"error": f"Invalid value for {field}"}), 400

    # Pagination
    try:
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("page_size", 10))
        if page < 1 or page_size < 1:
            raise ValueError
    except ValueError:
        return jsonify({"error": "Invalid page or page_size"}), 400
    skip = (page - 1) * page_size

    # Query MongoDB
    total = collection.count_documents(query)
    cursor = collection.find(query, {"_id": 0}).skip(skip).limit(page_size)
    results = list(cursor)

    return jsonify({
        "results": results,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size
        }
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
