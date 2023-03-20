from typing import List

import numpy as np
import pandas as pd
import tensorflow as tf


class ZScaler:

    def __init__(self,
                 df: pd.DataFrame,
                 scale_columns: List[str] = None,
                 label_columns: List[str] = None):
        """
        :param df: pandas.DataFrame to transform/inverse-transform w.r.t.
        :param label_columns: ordered list of columns that need to be
                              de-normalised from model output tensor.
        """
        self.mean = df.mean()
        self.std = df.std()
        self.scale_columns = scale_columns
        self.scale_column_indices = {name: i
                                     for i, name in enumerate(df.columns)
                                     if name in scale_columns}
        self.label_columns = label_columns

    def transform(self,
                  df: pd.DataFrame) -> np.array:
        """
        Scales the given pandas.DataFrame by calculating z-scores on each column
        with the mean and standard deviation of the training data.

        :param df: pandas.DataFrame to normalise.
        :return: column-wise z-normalised np.array.
        """
        df = df.copy()
        df[self.scale_columns] -= self.mean[self.scale_columns]
        df[self.scale_columns] /= self.std[self.scale_columns]
        return df.values

    def inverse_transform(self,
                          tensor: tf.Tensor,
                          is_input: bool = False) -> np.array:
        """
        Inverse scales the model output w.r.t. the label columns or `columns` if
        given. This is an in-place operation.

        :param outputs: tensor of shape (_, label_steps, label_features)
                        containing model outputs.
        :param is_input: whether the tensor is of the input format so that we
                         scale w.r.t the scale columns instead of label columns.
        """
        if is_input:
            for column_name, i in self.scale_column_indices.items():
                tensor[:, i] *= self.std[column_name]
                tensor[:, i] += self.mean[column_name]
        else:
            for i, label_name in enumerate(self.label_columns):
                # For all outputs in this label column, inverse z-score transform
                # the values.
                tensor[:, i] *= self.std[label_name]
                tensor[:, i] += self.mean[label_name]
