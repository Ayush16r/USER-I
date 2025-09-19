from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from datetime import datetime, timezone
import os

app = Flask(__name__)

# ---------------- MongoDB Setup ----------------
MONGO_URI = os.environ.get("MONGO_URI")  # must be set in Render dashboard
if not MONGO_URI:
    raise Exception("❌ Please set the MONGO_URI environment variable in Render")

client = MongoClient(MONGO_URI)
db = client.get_database(os.environ.get("DB_NAME", "mydb"))  # default mydb
bookings_col = db[os.environ.get("COLL", "bookings")]        # default bookings

# Expected time per department (minutes per patient)
DEPT_TIME = {
    "General Medicine": 4,
    "Orthopedics": 3,
    "ENT": 5,
    "Dermatology": 4
}

# ---------------- ROUTES ----------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/live-appointments")
def live_appointments():
    return render_template("live_appointments.html")

@app.route("/hospitals-near-me")
def hospitals_near_me():
    return render_template("hospitals_near_me.html")

@app.route("/med_box")
def med_box():
    return render_template("med_box.html")

@app.route("/feedback_reward")
def feedback_reward():
    return render_template("feedback_reward.html")

# ---------------- GET BOOKING WITH ESTIMATED WAIT ----------------
@app.route("/get_booking", methods=["POST"])
def get_booking():
    data = request.get_json()
    booking_id = data.get("bookingId") if data else None
    if not booking_id:
        return jsonify({"error": "No Booking ID provided"}), 400

    booking = bookings_col.find_one({"booking_id": booking_id})
    if not booking:
        return jsonify({"error": "Booking ID not found"}), 404

    department = booking.get("department", "General Medicine")
    per_patient_time = DEPT_TIME.get(department, 5)  # default 5 mins if not in map

    # Ensure created_at is present
    if "created_at" not in booking:
        booking["created_at"] = datetime.now(timezone.utc)
        bookings_col.update_one(
            {"_id": booking["_id"]},
            {"$set": {"created_at": booking["created_at"]}}
        )

    # Count patients in same department before this booking (not completed yet)
    queue_count = bookings_col.count_documents({
        "department": department,
        "status": {"$ne": "completed"},
        "created_at": {"$lt": booking["created_at"]}
    })

    estimated_wait = queue_count * per_patient_time

    return jsonify({
        "slot": booking.get("appointment_time", ""),
        "name": booking.get("patient_name", ""),
        "estimated_wait": estimated_wait
    })

# ---------------- Run ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render provides PORT env
    app.run(host="0.0.0.0", port=port, debug=False)
