from flask import Flask, request, url_for, redirect, render_template, jsonify
from pycaret.classification import *
import pandas as pd
import pickle
import numpy as np
import config
from pycaret.utils import check_metric


app = Flask(__name__)

model = load_model('models/model_cbc')
cols = ['Mean of the integrated profile', 'Standard deviation of the integrated profile',
        'Excess kurtosis of the integrated profile', 'Skewness of the integrated profile',
        'Mean of the DM-SNR curve', 'Standard deviation of the DM-SNR curve',
        'Excess kurtosis of the DM-SNR curve', 'Skewness of the DM-SNR curve']


@app.route('/')
def home():
    return render_template("index.html")


@app.route('/predict', methods=['POST'])
def predict():
    int_features = [x for x in request.form.values()]
    final = np.array(int_features)
    data_unseen = pd.DataFrame([final], columns=cols)
    prediction = predict_model(model, data=data_unseen, round=2)
    scores = prediction.Score[0]
    prediction = int(prediction.Label[0])
    return render_template("index.html", pred='Pulsar candidate class - {}'.format(prediction),
                           score_pred='Score - {}' .format(scores))


@app.route('/predict_api', methods=['POST'])
def predict_api():
    data = request.get_json(force=True)
    data_unseen = pd.DataFrame([data])
    prediction = predict_model(model, data=data_unseen)
    output = prediction.Label[0]
    return jsonify(output)


if __name__ == '__main__':
    app.run(host="127.0.0.1", port=config.PORT, debug=config.DEBUG_MODE)
