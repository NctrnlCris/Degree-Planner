"""
Flask backend app that handles parsing the input .xlsx file.
"""
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from processing import get_processed_with_credits, get_processed_remaining

app = Flask(__name__)
CORS(app)  # This allows your React app at localhost:5173 to talk to this server

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Handles the file upload.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        # Determine extension from uploaded filename
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ('.xlsx', '.xls', '.csv'):
            return jsonify({"error": "Only Excel (.xlsx, .xls) and CSV files are supported"}), 400

        filename = "temp_transcript"
        filepath = os.path.join(UPLOAD_FOLDER, f"{filename}{ext}")
        file.save(filepath)

        try:
            # 1. Get Credit-based data (The Progress Rings)
            credits_json = get_processed_with_credits(filepath)

            # 2. Get Remaining data (The List Cards)
            remaining_json = get_processed_remaining(filepath)

            # Parse JSON strings so frontend receives arrays, not escaped strings
            credits_output = json.loads(credits_json)
            lists_output = json.loads(remaining_json)

            # Return both to the frontend
            return jsonify({
                "credits": credits_output,
                "lists": lists_output
            }), 200
        except Exception as e: # pylint: disable=broad-exception-caught
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
