import os, json, psycopg2, psycopg2.extras
from fastapi import FastAPI
import requests
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from xrpl_utils import send_rlusd_payment, save_record, send_rlusd_payment_from_seed

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    return psycopg2.connect(os.getenv("POSTGRES_URL"))

class DonationReq(BaseModel):
    charity: str             # "MEDA" or "TARA"
    cid: str                 # cause id
    amount: float
    donor_email: str | None = None

class DonorIntentRequest(BaseModel):
    donorIntent: str
    amountFiat: float
    currency: str = "CAD"
    donorEmail: str = ""
    isPublic: bool = False

class XummPaymentConfirmation(BaseModel):
    payload_id: str
    transaction_hash: str
    charity: str
    cause_id: str
    amount: float
    donor_email: str | None = None

class ServerSignedUserPayment(BaseModel):
    sender_seed: str
    charity: str
    amount: float = 1.0
    cause_id: str = "demo_user_to_charity"

class XamanPaymentRequest(BaseModel):
    destination: str
    amount: float
    charity: str
    cause_id: str
    asset: str | None = None  # 'XRP' for native, else RLUSD by default
    issuer: str | None = None # optional custom issuer for IOU

@app.post("/donate")
async def donate(req: DonationReq):
    tx_hash, memo = send_rlusd_payment(req.charity.upper(), req.cid, req.amount)
    rec = {**memo, "tx": tx_hash, "donor_email": req.donor_email}
    save_record(rec)
    return {"tx": tx_hash,
            "track": f"https://testnet.xrpl.org/transactions/{tx_hash}"}

@app.post("/donations")
async def submit_donor_intent(req: DonorIntentRequest):
    """
    Handle WhisperFlow donor intent submissions
    Maps donor intent to charity donation and processes XRPL payment
    """
    # For now, default to MEDA charity - could be enhanced with story routing
    # Generate a cause ID from the donor intent (simplified)
    cause_id = f"whisper_{hash(req.donorIntent) % 10000:04d}"
    
    # Convert CAD to RLUSD (1:1 for demo, could add exchange rate)
    amount_rlusd = req.amountFiat
    
    # Use MEDA as default charity (could route based on story parameter)
    charity = "MEDA"
    
    try:
        # Create XRPL transaction
        tx_hash, memo = send_rlusd_payment(charity, cause_id, amount_rlusd)
        
        # Save donation record with donor intent
        rec = {
            **memo, 
            "tx": tx_hash, 
            "donor_email": req.donorEmail if req.isPublic else None,
            "donor_intent": req.donorIntent,
            "is_public": req.isPublic,
            "payment_method": "whisper_flow",
            "currency_fiat": req.currency,
            "amount_fiat": req.amountFiat
        }
        save_record(rec)
        
        return {
            "success": True,
            "transactionHash": tx_hash,
            "transactionUrl": f"https://testnet.xrpl.org/transactions/{tx_hash}",
            "message": "Your message and support have been sent successfully"
        }
        
    except Exception as e:
        print(f"Error processing donor intent: {e}")
        # Return success for UX but log the error
        return {
            "success": True,
            "message": "Your message has been received and will be processed"
        }

@app.post("/xumm/confirm-payment")
async def confirm_xumm_payment(confirmation: XummPaymentConfirmation):
    """Handle Xumm payment confirmation"""
    try:
        # Create donation record from Xumm payment
        memo = {
            "cid": confirmation.cause_id,
            "chr": confirmation.charity.upper(),
            "amt": confirmation.amount,
            "cur": "RLUSD",
            "ts": psycopg2.sql.SQL("NOW()"),
            "ph": f"xumm_{confirmation.payload_id}"  # Xumm-specific hash
        }
        
        rec = {
            **memo,
            "tx": confirmation.transaction_hash,
            "donor_email": confirmation.donor_email,
            "payment_method": "xumm",
            "payload_id": confirmation.payload_id
        }
        
        save_record(rec)
        
        return {
            "status": "success",
            "transaction_hash": confirmation.transaction_hash,
            "track": f"https://testnet.xrpl.org/transactions/{confirmation.transaction_hash}"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/demo/user-to-charity")
async def demo_user_to_charity(req: ServerSignedUserPayment):
    """Server-signed demo: send RLUSD from provided user seed to charity"""
    tx_hash, memo = send_rlusd_payment_from_seed(req.sender_seed, req.charity.upper(), req.cause_id, req.amount)
    rec = {**memo, "tx": tx_hash, "ph": memo.get("ph")}
    save_record(rec)
    return {"tx": tx_hash, "track": f"https://testnet.xrpl.org/transactions/{tx_hash}"}

@app.post("/xaman/create-payment")
async def xaman_create_payment(req: XamanPaymentRequest):
    """
    Create a Xaman payload (server-side) for a Payment transaction and return QR and payload id.
    """
    api_key = os.getenv("XAMAN_API_KEY") or os.getenv("XUMM_API_KEY")
    api_secret = os.getenv("XAMAN_API_SECRET") or os.getenv("XUMM_API_SECRET")
    if not api_key or not api_secret:
        return {"success": False, "error": "Xaman API credentials missing"}

    print(f"Xaman API Key: {api_key[:8]}...")
    print(f"Xaman API Secret: {api_secret[:8]}...")

    # Build memo
    memo_hex = json.dumps({
        "transactionId": f"srv_{req.cause_id}",
        "charity": req.charity,
        "causeId": req.cause_id
    }).encode().hex()

    txjson = {
        "TransactionType": "Payment",
        "Destination": req.destination,
        "Memos": [{"Memo": {"MemoData": memo_hex}}],
    }

    # Choose asset: native XRP vs RLUSD IOU
    if (req.asset or "").upper() == "XRP":
        # amount is in XRP, convert to drops (1 XRP = 1,000,000 drops)
        drops = str(int(round(req.amount * 1_000_000)))
        txjson["Amount"] = drops
    else:
        txjson["Amount"] = {
            "value": str(req.amount),
            "currency": "524C555344000000000000000000000000000000",
            "issuer": req.issuer or "rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV",
        }

    print(f"Xaman request txjson: {json.dumps(txjson, indent=2)}")

    try:
        resp = requests.post(
            "https://xumm.app/api/v1/platform/payload",
            headers={
                "X-API-Key": api_key,
                "X-API-Secret": api_secret,
                "Content-Type": "application/json",
            },
            json={"txjson": txjson}
        )
        data = resp.json()
        print(f"Xaman API response status: {resp.status_code}")
        print(f"Xaman API response: {json.dumps(data, indent=2)}")
        
        if resp.status_code >= 400:
            return {"success": False, "error": data.get("error", str(data))}
        return {
            "success": True,
            "payloadId": data.get("uuid"),
            "qrCode": data.get("refs", {}).get("qr_png"),
            "refs": data.get("refs", {})
        }
    except Exception as e:
        print(f"Xaman API exception: {e}")
        return {"success": False, "error": str(e)}

@app.get("/xaman/payload/{payload_id}")
async def xaman_check_payload(payload_id: str):
    """
    Check the status of a Xaman payload using server-side API credentials.
    """
    api_key = os.getenv("XAMAN_API_KEY") or os.getenv("XUMM_API_KEY")
    api_secret = os.getenv("XAMAN_API_SECRET") or os.getenv("XUMM_API_SECRET")
    if not api_key or not api_secret:
        return {"success": False, "error": "Xaman API credentials missing"}

    try:
        resp = requests.get(
            f"https://xumm.app/api/v1/platform/payload/{payload_id}",
            headers={
                "X-API-Key": api_key,
                "X-API-Secret": api_secret,
                "Content-Type": "application/json",
            }
        )
        data = resp.json()
        print(f"Xaman payload check response: {json.dumps(data, indent=2)}")
        
        if resp.status_code >= 400:
            return {"success": False, "error": data.get("error", str(data))}
        
        # Check if payload is signed
        if data.get("response"):
            return {
                "success": True,
                "completed": True,
                "txid": data.get("response", {}).get("txid"),
                "account": data.get("response", {}).get("account"),
                "status": "completed"
            }
        else:
            return {
                "success": True,
                "completed": False,
                "status": "pending"
            }
    except Exception as e:
        print(f"Xaman payload check exception: {e}")
        return {"success": False, "error": str(e)}

@app.get("/totals")
async def totals():
    with get_db(), get_db().cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
        cur.execute("SELECT data->>'chr' chr, SUM((data->>'amt')::NUMERIC) total "
                    "FROM donations GROUP BY chr;")
        return {row["chr"]: float(row["total"]) for row in cur.fetchall()}

@app.get("/scores/{charity}")
async def scores(charity:str):
    view = "meda_features" if charity.upper()=="MEDA" else "tara_features"
    with get_db(), get_db().cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
        cur.execute(f"SELECT donor_hash, gift_count FROM {view};")
        return [{"ph": r["donor_hash"], "gift_count": r["gift_count"]} for r in cur.fetchall()]

@app.post("/payout/{charity}")
async def payout(charity: str):
    # Mock off-ramp
    return {"charity": charity, "status": "queued", "ref": f"OFFMOCK-{charity.upper()}"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "eunoia-atlas-api"} 