from flask import Flask, render_template, request, jsonify, redirect, url_for
import csv
import os

app = Flask(__name__)

# File paths
DEMOGRAPHICS_CSV = "demographics.csv"
LIVE_APPOINTMENTS_CSV = "live_appointments.csv"

# Ensure both CSV files have headers if they don't exist
if not os.path.exists(DEMOGRAPHICS_CSV):
    with open(DEMOGRAPHICS_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Name", "Age", "Gender"])  # adjust headers to your form

if not os.path.exists(LIVE_APPOINTMENTS_CSV):
    with open(LIVE_APPOINTMENTS_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Specialty", "Date", "Location"])  # adjust headers to your form


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


# -------- SAVE DEMOGRAPHICS --------
@app.route("/save_demographics", methods=["POST"])
def save_demographics():
    data = request.get_json()
    if not data:
        return jsonify({"message": "❌ No data received"}), 400

    file_exists = os.path.isfile(DEMOGRAPHICS_CSV)

    with open(DEMOGRAPHICS_CSV, "a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=data.keys())
        if not file_exists:
            writer.writeheader()
        writer.writerow(data)

    return jsonify({"message": "✅ Demographics saved!"})


# -------- SAVE LIVE APPOINTMENTS --------
@app.route("/save_live_appointment", methods=["POST"])
def save_live_appointment():
    specialty = request.form.get("specialty")
    date = request.form.get("date")
    location = request.form.get("location")

    with open(LIVE_APPOINTMENTS_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([specialty, date, location])

    return redirect(url_for("hospitals_near_me"))


# -------- SEARCH FEATURE --------
@app.route("/search")
def search():
    query = request.args.get("q", "")
    return render_template("search_results.html", query=query)


# ---------------- RUN APP ----------------
if __name__ == "__main__":
    app.run(debug=True)
