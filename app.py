
from flask import Flask, render_template, request, jsonify
from datetime import datetime

app = Flask(__name__)

departments = [
    "General Medicine",
    "Cardiology",
    "Neurology",
    "Orthopedics"
]

queues = {dept: [] for dept in departments}
current_patients = {dept: None for dept in departments}

token_number = 1


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/register", methods=["POST"])
def register():
    global token_number

    data = request.get_json()

    name = data.get("name", "").strip()
    dept = data.get("department", "")

    if not name or dept not in departments:
        return jsonify({"error": "Invalid patient details"}), 400

    patient = {
        "token": token_number,
        "name": name,
        "department": dept,
        "status": "Waiting",
        "time": datetime.now().strftime("%I:%M %p")
    }

    queues[dept].append(patient)
    token_number += 1

    return jsonify({
        "message": "Patient registered successfully",
        "patient": patient
    })


@app.route("/waiting/<department>")
def waiting(department):
    if department not in departments:
        return jsonify({"error": "Invalid department"}), 400

    return jsonify(queues[department])


@app.route("/next/<department>", methods=["POST"])
def next_patient(department):
    if department not in departments:
        return jsonify({"error": "Invalid department"}), 400

    if not queues[department]:
        return jsonify({"error": "No patients waiting"}), 404

    patient = queues[department].pop(0)
    patient["status"] = "Serving"

    current_patients[department] = patient

    return jsonify(patient)


@app.route("/current/<department>")
def current(department):
    if department not in departments:
        return jsonify({"error": "Invalid department"}), 400

    return jsonify(current_patients[department] or {})


if __name__ == "__main__":
    app.run(debug=True)
