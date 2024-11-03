from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime
import pytz

# MongoDB connection setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]

app = Flask(__name__)
CORS(app)  # Enable CORS

# Set up MongoDB client
client = MongoClient("mongodb://db:27017/")
db = client.guestlist  # Database name
guests_collection = db.guests  # Collection name

@app.route('/add_guest', methods=['POST'])
def add_guest():
    data = request.json
    if not data:
        return jsonify({"message": "No data provided"}), 400

    # Extract guest data
    name = data.get("name")
    phone = data.get("phone")
    tz = pytz.timezone('Etc/GMT-2')  # GMT+2 is represented as GMT-2 in pytz
    submission_date = datetime.now(tz).strftime('%d/%m %H:%M')  # Format without seconds/milliseconds

    # Insert guest into MongoDB
    guests_collection.insert_one({
        "name": name,
        "phone": phone,
        "submissionDate": submission_date
    })

    return jsonify({"message": "Guest added successfully"}), 201

@app.route('/guests', methods=['GET'])
def get_guests():
    try:
        guests = list(guests_collection.find({}, {'_id': 0}))  # Exclude the _id field
        
        # Prepare statistics
        total_guests = len(guests)

        return jsonify({"guests": guests, "totalGuests": total_guests})
    except Exception as e:
        print(f"Error fetching guests: {e}")  # Log the error to the console
        return jsonify({"message": "An error occurred while fetching guests.", "error": str(e)}), 500



@app.route('/delete_guest', methods=['DELETE'])
def delete_guest():
    data = request.json
    phone = data.get("phone")
    if not phone:
        return jsonify({"message": "No phone number provided"}), 400

    result = guests_collection.delete_one({"phone": phone})
    if result.deleted_count == 0:
        return jsonify({"message": "Guest not found"}), 404

    return jsonify({"message": "Guest deleted successfully"}), 200

@app.route('/edit_guest', methods=['PUT'])
def edit_guest():
    data = request.json
    phone = data.get("phone")
    if not phone:
        return jsonify({"message": "No phone number provided"}), 400

    updated_data = {}
    if "name" in data:
        updated_data["name"] = data["name"]

    if not updated_data:  # No fields to update
        return jsonify({"message": "No fields to update."}), 400

    result = guests_collection.update_one({"phone": phone}, {"$set": updated_data})
    if result.modified_count == 0:
        return jsonify({"message": "Guest not found or no changes made"}), 404

    return jsonify({"message": "Guest updated successfully"}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7000)
