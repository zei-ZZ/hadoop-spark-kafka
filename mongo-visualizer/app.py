from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import requests  # Add requests import

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

@app.route("/firehotspots", methods=["GET"])
def get_fire_hotspots():
    collection = db["fire-hotspots"]

    # Get top 5 countries by rank
    cursor = collection.find({}, {"_id": 0}).sort("Rank", 1).limit(5)
    results = list(cursor)

    return jsonify({
        "results": results
    })

@app.route("/earthquakehotspots", methods=["GET"])
def get_earthquake_hotspots():
    collection = db["earthquake-hotspots"]

    # Get top 5 countries by rank
    cursor = collection.find({}, {"_id": 0}).sort("Rank", 1).limit(5)
    results = list(cursor)

    return jsonify({
        "results": results
    })

@app.route("/floodhotspots", methods=["GET"])
def get_flood_hotspots():
    collection = db["flood-hotspots"]

    # Get top 5 countries by rank
    cursor = collection.find({}, {"_id": 0}).sort("Rank", 1).limit(5)
    results = list(cursor)

    return jsonify({
        "results": results
    })

@app.route("/stormhotspots", methods=["GET"])
def get_storm_hotspots():
    collection = db["storm-hotspots"]

    # Get top 5 countries by rank
    cursor = collection.find({}, {"_id": 0}).sort("Rank", 1).limit(5)
    results = list(cursor)

    return jsonify({
        "results": results
    })

@app.route("/volcanohotspots", methods=["GET"])
def get_volcano_hotspots():
    collection = db["volcano-hotspots"]

    # Get top 5 countries by rank
    cursor = collection.find({}, {"_id": 0}).sort("Rank", 1).limit(5)
    results = list(cursor)

    return jsonify({
        "results": results
    })


@app.route("/correlations", methods=["GET"])
def get_correlations():
    collection = db["correlations"]

    # Allowed filters
    filter_fields = {
        "country": "Country",
        "disaster_type_a": "DisasterType_A",
        "event_name_a": "EventName_A",
        "disaster_type_b": "DisasterType_B",
        "event_name_b": "EventName_B",
        "days_between": "Days_Between",
    }

    query = {}
    for param, field in filter_fields.items():
        arg = request.args.get(param)
        if arg is not None:
            try:
                if field == "Days_Between":
                    query[field] = int(arg)
                else:
                    query[field] = arg
            except ValueError:
                return jsonify({"error": f"Invalid value for {field}"}), 400

    # Date filtering
    date_filters = {
        "start_date_a_from": ("StartDate_A", "$gte"),
        "start_date_a_to": ("StartDate_A", "$lte"),
        "start_date_b_from": ("StartDate_B", "$gte"),
        "start_date_b_to": ("StartDate_B", "$lte"),
    }

    for param, (field, op) in date_filters.items():
        arg = request.args.get(param)
        if arg:
            try:
                dt = datetime.fromisoformat(arg)
                query.setdefault(field, {})[op] = dt
            except ValueError:
                return jsonify({"error": f"Invalid date format for {param}. Use YYYY-MM-DD"}), 400

    # Pagination
    try:
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("page_size", 10))
        if page < 1 or page_size < 1:
            raise ValueError
    except ValueError:
        return jsonify({"error": "Invalid page or page_size"}), 400
    skip = (page - 1) * page_size

    # Query
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


@app.route("/vulnerability", methods=["GET"])
def get_vulnerability_index():
    collection = db["vulnerabilityIndex"]
    
    # Define allowed filter fields and their types
    filter_fields = {
        "country": "Country",
        "min_disaster_count": "Disaster_Count",
        "max_disaster_count": "Disaster_Count",
        "min_total_damage": "Total_Damage",
        "max_total_damage": "Total_Damage",
        "min_total_deaths": "Total_Deaths",
        "max_total_deaths": "Total_Deaths",
        "min_vulnerability": "Vulnerability_Index",
        "max_vulnerability": "Vulnerability_Index",
        "min_recovery_days": "Avg_Recovery_Days",
        "max_recovery_days": "Avg_Recovery_Days"
    }
    
    # Build MongoDB filter from query params
    query = {}
    for param, field in filter_fields.items():
        arg = request.args.get(param)
        if arg is not None:
            try:
                if param == "country":
                    # Use case-insensitive regex for country name
                    query[field] = {"$regex": arg, "$options": "i"}
                else:
                    value = float(arg)
                    if param.startswith("min_"):
                        query[field] = {"$gte": value}
                    elif param.startswith("max_"):
                        if field in query:
                            query[field]["$lte"] = value
                        else:
                            query[field] = {"$lte": value}
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

    # Get sort field and direction
    sort_field = request.args.get("sort_by", "Vulnerability_Index")
    sort_direction = -1 if request.args.get("sort_direction", "desc") == "desc" else 1

    # Query MongoDB
    total = collection.count_documents(query)
    cursor = collection.find(query, {"_id": 0}).sort(sort_field, sort_direction).skip(skip).limit(page_size)
    results = list(cursor)

    # Calculate average vulnerability for all countries
    avg_vulnerability = collection.aggregate([
        {"$group": {
            "_id": None,
            "avg_vulnerability": {"$avg": "$Vulnerability_Index"},
            "critical_count": {
                "$sum": {
                    "$cond": [{"$gte": ["$Vulnerability_Index", 0.06]}, 1, 0]
                }
            }
        }}
    ]).next()

    return jsonify({
        "results": results,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size
        },
        "stats": {
            "avg_vulnerability": round(avg_vulnerability["avg_vulnerability"], 4),
            "critical_count": avg_vulnerability["critical_count"]
        }
    })

def process_earthquake_data(data):
    """Process earthquake data and add derived fields."""
    processed = []
    for event in data:
        # Extract location
        place_parts = event.get('place', '').split(',')
        city = place_parts[0].strip() if place_parts else event.get('place', 'Unknown')
        country = place_parts[1].strip() if len(place_parts) > 1 else 'Unknown'
        
        # Add severity based on magnitude
        magnitude = event.get('magnitude', 0)
        if magnitude < 4.0:
            severity = "Low"
        elif magnitude < 6.0:
            severity = "Moderate"
        elif magnitude < 7.0:
            severity = "High"
        else:
            severity = "Extreme"
        
        processed_event = {
            **event,
            'city': city,
            'country': country,
            'severity': severity,
            'type': 'earthquake',
            'processed_time': datetime.utcnow()
        }
        processed.append(processed_event)
    return processed

def process_fire_data(data):
    """Process fire data and add derived fields."""
    processed = []
    for event in data:
        # Add severity based on confidence
        confidence = event.get('confidence', 0)
        if confidence < 30:
            severity = "Low"
        elif confidence < 60:
            severity = "Moderate"
        elif confidence < 80:
            severity = "High"
        else:
            severity = "Extreme"
        
        processed_event = {
            **event,
            'type': 'fire',
            'severity': severity,
            'processed_time': datetime.utcnow()
        }
        processed.append(processed_event)
    return processed

@app.route("/earthquakes", methods=["GET"])
def get_earthquakes():
    try:
        # Get query parameters
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("page_size", 10))
        severity = request.args.get("severity", "all")
        time_range = request.args.get("time_range", "1h")
        
        # Calculate time filter
        now = datetime.utcnow()
        if time_range == "1h":
            time_filter = now - timedelta(hours=1)
        elif time_range == "2h":
            time_filter = now - timedelta(hours=2)
        elif time_range == "3h":
            time_filter = now - timedelta(hours=3)
        elif time_range == "6h":
            time_filter = now - timedelta(hours=6)
        elif time_range == "12h":
            time_filter = now - timedelta(hours=12)
        elif time_range == "24h":
            time_filter = now - timedelta(hours=24)
        else:
            time_filter = now - timedelta(hours=1)  # Default to 1 hour
        
        # Get data from our own API endpoint
        url = "http://localhost:5001/earthquakes"
        params = {
            "page": page,
            "page_size": page_size,
            "severity": severity,
            "time_range": time_range
        }
        response = requests.get(url, params=params)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch earthquake data"}), 500
            
        data = response.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/fires", methods=["GET"])
def get_fires():
    try:
        # Get query parameters
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("page_size", 10))
        severity = request.args.get("severity", "all")
        time_range = request.args.get("time_range", "1h")
        
        # Calculate time filter
        now = datetime.utcnow()
        if time_range == "1h":
            time_filter = now - timedelta(hours=1)
        elif time_range == "2h":
            time_filter = now - timedelta(hours=2)
        elif time_range == "3h":
            time_filter = now - timedelta(hours=3)
        elif time_range == "6h":
            time_filter = now - timedelta(hours=6)
        elif time_range == "12h":
            time_filter = now - timedelta(hours=12)
        elif time_range == "24h":
            time_filter = now - timedelta(hours=24)
        else:
            time_filter = now - timedelta(hours=1)  # Default to 1 hour
        
        # Get data from our own API endpoint
        url = "http://localhost:5001/fires"
        params = {
            "page": page,
            "page_size": page_size,
            "severity": severity,
            "time_range": time_range
        }
        response = requests.get(url, params=params)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch fire data"}), 500
            
        data = response.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
