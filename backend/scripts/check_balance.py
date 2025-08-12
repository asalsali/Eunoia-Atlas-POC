import os
from xrpl.clients import JsonRpcClient
from xrpl.models.requests import AccountLines

USER_ADDRESS = os.getenv("USER_WALLET_ADDRESS", "rJMTFTr9d1MMXyMKJR844UbYeTCbsPVYQj")
RLUSD_ISSUER = os.getenv("RLUSD_ISSUER", "rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV")
XRPL_RPC = os.getenv("XRPL_RPC", "https://s.altnet.rippletest.net:51234")

client = JsonRpcClient(XRPL_RPC)

req = AccountLines(account=USER_ADDRESS, peer=RLUSD_ISSUER)
res = client.request(req).result
lines = res.get("lines", [])

print(f"Address: {USER_ADDRESS}")
print(f"Issuer:  {RLUSD_ISSUER}")
if not lines:
    print("No trustlines found with issuer")
else:
    for line in lines:
        currency = line.get("currency")
        balance = line.get("balance")
        limit = line.get("limit")
        print(f"Currency: {currency}  Balance: {balance}  Limit: {limit}")


