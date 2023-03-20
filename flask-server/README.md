# Flask Back-End Serving TensorFlow Models

Ensure you have a Python environment enabled for the project with `Flask`, `numpy`, `pandas` and `TensorFlow` installed.
(or just `pip install -r requirements.txt`).


Run
```zsh
flask run [--port=<PORT>]
```

This runs the server at `http://127.0.0.1:<PORT>` (default port is 5000). You can try sending a `GET` request to the `/` endpoint and it should
return `'Hello, World!'`.

You can query for predictions on the next 7 days by sending a `GET` request to the `/predict/<coin_id>/<vs_currency>`
endpoint, e.g. for a 7-day prediction on BTC in USD, the endpoint to send requests to is `/predict/BTC/USD`. Make
sure the `<coin_id>` and `<vs_currency>` matches Yahoo Finance's ticker symbol format.

The models in `tf_models` have been trained for BTC, ETH, DOGE, USDT and XRP for each of the currencies USD, GBP and CAD (declared in `etc/coin_vs_currency.json`).


## TODO!

THIS IS BARE MINIMAL.

- [ ] THIS DOES NO ERROR HANDLING AT ALL. Need to handle problematic input like non-existent coin IDs or versus currencies
      and also need to fix the yahoo\_finance.py function that fetches the data because it keeps NaNs in the df but is not
      getting pre-processed. Need to move functions from notebook to handle this.
