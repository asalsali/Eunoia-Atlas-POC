import os, json, time, psycopg2, xrpl
from xrpl.models.requests import AccountTx

def get_db():
    return psycopg2.connect(os.getenv("POSTGRES_URL"))

CLIENT = xrpl.clients.JsonRpcClient(os.getenv("XRPL_RPC"))

def get_wallet_addresses():
    try:
        meda = xrpl.wallet.Wallet.from_seed(os.getenv("MEDA_WALLET_SEED")).classic_address
        tara = xrpl.wallet.Wallet.from_seed(os.getenv("TARA_WALLET_SEED")).classic_address
        return {meda: "MEDA", tara: "TARA"}
    except Exception as e:
        print(f"Warning: Could not initialize wallet addresses: {e}")
        return {}

def insert(tx_hash: str, memo: dict):
    with get_db(), get_db().cursor() as cur:
        cur.execute("INSERT INTO donations (tx,data) VALUES (%s,%s) ON CONFLICT DO NOTHING",
                    (tx_hash, json.dumps(memo)))
        get_db().commit()

def poll():
    print("Starting XRPL listener...")
    watch = get_wallet_addresses()
    if not watch:
        print("No valid wallet addresses found, running in mock mode")
        # Run in mock mode - just keep the service alive
        while True:
            time.sleep(10)
            print("Listener running in mock mode...")
        return
    
    print(f"Watching addresses: {list(watch.keys())}")
    
    # Initialize ledger tracking
    for addr in watch:
        try:
            last = CLIENT.request(AccountTx(account=addr, limit=1)).result["transactions"]
            if last: 
                watch[addr] = int(last[0]["ledger_index"])
                print(f"Initialized {addr} at ledger {watch[addr]}")
        except Exception as e:
            print(f"Error initializing {addr}: {e}")
            watch[addr] = 0
    
    while True:
        try:
            for addr, chr_id in list(watch.items()):
                req = AccountTx(account=addr, ledger_index_min=watch[addr]+1, ledger_index_max=-1)
                txs = CLIENT.request(req).result["transactions"]
                for t in txs:
                    tx_json = t["tx_json"]; meta = t["meta"]
                    if "Memos" in tx_json and tx_json["Memos"]:
                        memo_hex = tx_json["Memos"][0]["Memo"]["MemoData"]
                        memo = json.loads(bytes.fromhex(memo_hex))
                        insert(tx_json["hash"], memo)
                        print(f"Processed transaction: {tx_json['hash']}")
                    watch[addr] = int(t["ledger_index"])
            time.sleep(4)
        except Exception as e:
            print(f"Error in polling loop: {e}")
            time.sleep(10)

if __name__ == "__main__": poll() 