"""
Main app code
"""
from flask import Flask, render_template, request, redirect, url_for, Response
from processing import UPLOAD_DIR, get_processed_with_credits, get_processed_remaining
app = Flask(__name__)


@app.route('/')
def index():
    """
    Shows HTML for main page (mainly for testing)
    """
    return render_template("index.html")

@app.route('/', methods=['POST'])
def upload_file():
    """
    Handle uploaded file and save it to the "uploads" directory.
    """
    uploaded_file = request.files['file']
    if uploaded_file.filename != '':
        uploaded_file.save(f"{UPLOAD_DIR}/{uploaded_file.filename}")
    return redirect(url_for('index'))

@app.route('/<string:file_name>/credits')
def get_credits_info(file_name):
    """
    Processes the corresponding file from the URL and returns
    the .json file with the credits breakdown for applicable requirements
    NOTE: the URL should not contain the file extension. It is assumed to be .xlsx.
    
    :param file_name: the name of the input file to process.
    """
    return Response(get_processed_with_credits(file_name), mimetype='application/json')

@app.route('/<string:file_name>/remaining')
def get_remaining_info(file_name):
    """
    Processes the corresponding file from the URL and returns
    the .json file with the credits breakdown for applicable requirements
    NOTE: the URL should not contain the file extension. It is assumed to be .xlsx.
    
    :param file_name: the name of the input file to process.
    """

    return Response(get_processed_remaining(file_name), mimetype='application/json')
