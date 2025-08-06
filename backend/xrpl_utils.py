import os, json, xrpl, psycopg2, jsonschema, pathlib
from datetime import datetime, timezone
from hashlib import sha256
import secrets

SCHEMA = json.load(open(pathlib.Path(__file__).parent/"edms_schema.json"))

def get_db():
    return psycopg2.connect(os.getenv("POSTGRES_URL"))

CLIENT = xrpl.clients.JsonRpcClient(os.getenv("XRPL_RPC"))

def get_wallets():
    try:
        meda_wallet = xrpl.wallet.Wallet.from_seed(os.getenv("MEDA_WALLET_SEED"))
        tara_wallet = xrpl.wallet.Wallet.from_seed(os.getenv("TARA_WALLET_SEED"))
        return {"MEDA": meda_wallet, "TARA": tara_wallet}
    except Exception as e:
        print(f"Warning: Could not initialize wallets: {e}")
        return {}

def _hash(blob: dict) -> str:
    return sha256(json.dumps(blob, sort_keys=True).encode()).hexdigest()

def send_rlusd_payment(charity: str, cid: str, amount: float):
    wallets = get_wallets()
    if charity not in wallets:
        raise ValueError(f"Invalid charity: {charity}")
    
    wallet = wallets[charity]
    memo = {
        "cid": cid,
        "chr": charity,
        "amt": amount,
        "cur": "RLUSD",
        "ts": datetime.now(timezone.utc).isoformat(timespec="seconds")
    }
    memo["ph"] = _hash(memo)
    
    # Validate memo against schema
    jsonschema.validate(memo, SCHEMA)

    # For PoC, we'll create a mock transaction hash since XRPL doesn't allow self-send
    mock_tx_hash = secrets.token_hex(32)
    
    print(f"Mock XRPL transaction created: {mock_tx_hash}")
    print(f"Wallet: {wallet.classic_address}")
    print(f"Memo: {json.dumps(memo)}")
    
    return mock_tx_hash, memo

def save_record(record: dict):
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO donations (tx, data) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (record["tx"], json.dumps(record))
            )
            conn.commit()
            print(f"Successfully saved record: {record['tx']}")
        conn.close()
    except Exception as e:
        print(f"Error saving record: {e}")
        if 'conn' in locals():
            conn.close()
        raise 