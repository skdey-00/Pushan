"""
Flask API Server - Override Endpoints and System Status
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from decision import set_override, clear_override, get_override_state
from main import get_system_state

app = Flask(__name__)
CORS(app)


@app.route("/override", methods=["POST"])
def override():
    """
    Set manual override
    Body: {"signal": "RED|YELLOW|GREEN", "speed_limit": 20|30|40|60|80}
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No body provided"}), 400

        signal = data.get("signal")
        speed_limit = data.get("speed_limit")

        if not signal or not speed_limit:
            return jsonify({"error": "Missing signal or speed_limit"}), 400

        # Validate
        signal = signal.upper()
        if signal not in ["RED", "YELLOW", "GREEN"]:
            return jsonify({"error": "Invalid signal"}), 400

        if speed_limit not in [20, 30, 40, 60, 80]:
            return jsonify({"error": "Invalid speed_limit"}), 400

        set_override(signal, speed_limit)

        return jsonify({
            "status": "ok",
            "signal": signal,
            "speed_limit": speed_limit
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/clear_override", methods=["POST"])
def clear_override_route():
    """Clear manual override"""
    try:
        clear_override()
        return jsonify({"status": "ok", "message": "Override cleared"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/status", methods=["GET"])
def status():
    """
    Get current system state
    Returns: JSON with current signal, sensors, car_count, etc.
    """
    try:
        state = get_system_state()
        return jsonify(state), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200


def run_api_server():
    """Run Flask API server"""
    from config import FLASK_HOST, FLASK_PORT
    print(f"Starting Flask API server on {FLASK_HOST}:{FLASK_PORT}")
    app.run(host=FLASK_HOST, port=FLASK_PORT, threaded=True)


if __name__ == "__main__":
    run_api_server()
