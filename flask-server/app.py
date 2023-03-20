from typing import List
import json
import pickle as pkl
import requests

from flask import Flask
from flask_cors import CORS
import numpy as np
import pandas as pd
import tensorflow as tf

from zscaler import ZScaler
import yahoo_finance as yf


"""
Minimal Flask application to serve 7-day predictions.

Runs on http://127.0.0.1:5000 by default, othewise set --port flag.
"""


app = Flask(__name__)
CORS(app)

models = dict()
# TODO: Create these as environment variables
config_path = 'etc/coin_vs_currency.json'
models_dir = 'tf_models'


class CryptoModelUnpickler(pkl.Unpickler):

    def find_class(self, module, name):
        if name == 'ZScaler':
            return ZScaler
        return super(CryptoModelUnpickler, self).find_class(module, name)


# Load all the models into a dict.
with open(config_path) as f:
    config = json.load(f)
    for coin_id in config.get('coin_id'):
        for vs_currency in config.get('vs_currency'):
            if coin_id not in models:
                models[coin_id] = dict()
            if vs_currency not in models[coin_id]:
                model_path = f'{models_dir}/{coin_id}_vs_{vs_currency}'
                restored_model = tf.keras.models.load_model(model_path)
                with open(f'{model_path}/zscaler.pkl', 'rb') as f:
                    unpkl = CryptoModelUnpickler(f)
                    restored_zscaler = unpkl.load()
                models[coin_id][vs_currency] = (restored_model, restored_zscaler)


print(json.dumps(models, indent=4, default=str))


@app.route('/')
def hello_world():
    return '<p>Hello, World!</p>'


@app.get('/predict/<coin_id>/<vs_currency>')
def predict(coin_id, vs_currency):
    global models
    df = yf.fetch_yahoo_finance_market_chart(coin_id, vs_currency, period='14d')
    model, zscaler = models[coin_id.upper()][vs_currency.upper()]
    inputs = zscaler.transform(df)
    inputs = inputs[np.newaxis]
    outputs = model.predict(inputs)
    outputs = outputs[0]
    zscaler.inverse_transform(outputs)
    predictions = outputs.flatten().tolist()

    # Generate next 7 dates as UNIX millisecond timestamps.
    dates = pd.date_range(start=df.index[-1],
                         periods=7,
                         tz=df.index.tz)
    dates += pd.DateOffset(1)
    dates = dates.map(pd.Timestamp.timestamp)
    dates = list(dates.map(int))

    return list(zip(dates, predictions))
    # return [123.4, 123.4, 123.4, 123.4, 123.4, 123.4, 123.4]
