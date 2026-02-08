"""
Main app code
"""
from flask import Flask, render_template, request, redirect, url_for, Response
from processing import UPLOAD_DIR, get_processed_with_credits, get_processed_remaining
app = Flask(__name__)


@app.route('/')
def index():
    return render_template("index.html")

@app.route('/', methods=['POST'])
def upload_file():
    """
    Handle uploaded file
    """
    uploaded_file = request.files['file']
    if uploaded_file.filename != '':
        uploaded_file.save(f"{UPLOAD_DIR}/{uploaded_file.filename}")
    return redirect(url_for('index'))

@app.route('/<string:file_name>/credits')
def get_credits_info(file_name):
    # 'user_id' is the variable captured from the URL
    return Response(get_processed_with_credits(file_name), mimetype='application/json')

@app.route('/<string:file_name>/remaining')
def get_remaining_info(file_name):
    # 'user_id' is the variable captured from the URL
    return Response(get_processed_remaining(file_name), mimetype='application/json')
