import pandas as pd
import yfinance as yf


def fetch_yahoo_finance_market_chart(coin_code: str,
                                     vs_currency: str,
                                     period: str = '5y') -> pd.DataFrame:
    df = yf.Ticker(f'{coin_code}-{vs_currency}').history(period=period,
                                                         interval='1d',  # Daily data
                                                         prepost=False,  # For daily data, do we need this?
                                                         repair=False,   # FIXME: Let yfinance repair problems in price data or I should fix instead?
                                                         keepna=True,    # FIXME: Let yfinance drop rows with NaN or I should impute instead?
                                                         timeout=None,   # FIXME: Default 10
                                                         raise_errors=True)

    # Returns pd.DataFrame with columns:
    #   ['Open', 'High', 'Low', 'Close', 'Volume', 'Dividends', 'Stock Splits']
    # 'Dividends' and 'Stock Splits' aren't useful (all 0s in df.describe())
    df.drop(columns=['Dividends', 'Stock Splits'], inplace=True)

    return df
