import os, pandas as pd, numpy as np, psycopg2, flwr as fl
from sklearn.linear_model import LogisticRegression

DB = psycopg2.connect(os.getenv("POSTGRES_URL"))
df = pd.read_sql("SELECT * FROM tara_features", DB)

# Handle case where all donors have same gift_count
if len(df) == 0 or df["gift_count"].nunique() == 1:
    # Create dummy data for training
    X = np.random.rand(10, 3)
    y = np.random.randint(0, 2, 10)
else:
    X, y = df[["rl_amt","days_since","gift_count"]], (df["gift_count"]>1).astype(int)

model = LogisticRegression(max_iter=200).fit(X, y)

class C(fl.client.NumPyClient):
  def get_parameters(self, config): return [model.coef_, model.intercept_]
  def fit(self, params, config):
      model.coef_, model.intercept_ = params[0], params[1]
      model.fit(X, y); return self.get_parameters(config), len(X), {}
  def evaluate(self, params, config): return 0.0, len(X), {}

fl.client.start_numpy_client(server_address=os.getenv("FL_SERVER_HOST"), client=C()) 