from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd
from processing import get_processed_with_credits, get_processed_remaining

app = Flask(__name__)
CORS(app)  # This allows your React app at localhost:5173 to talk to this server

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        # Save the file temporarily
        filename = "temp_transcript"
        # Note: If users upload CSV, you may need to convert to .xlsx 
        # or update processing.py to read_csv
        filepath = os.path.join(UPLOAD_FOLDER, f"{filename}.xlsx")
        file.save(filepath)

        try:
            # 1. Get Credit-based data (The Progress Rings)
            credits_json = get_processed_with_credits(filename)
            
            # 2. Get Remaining data (The List Cards)
            remaining_json = get_processed_remaining(filename)

            # Return both to the frontend
            return jsonify({
                "credits": credits_json,
                "lists": remaining_json
            }), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), shadow_500

if __name__ == '__main__':
    app.run(debug=True, port=5000)