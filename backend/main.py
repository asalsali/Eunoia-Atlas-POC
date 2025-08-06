import os, json, psycopg2, psycopg2.extras
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from xrpl_utils import send_rlusd_payment, save_record

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

@app.post("/donate")
async def donate(req: DonationReq):
    tx_hash, memo = send_rlusd_payment(req.charity.upper(), req.cid, req.amount)
    rec = {**memo, "tx": tx_hash, "donor_email": req.donor_email}
    save_record(rec)
    return {"tx": tx_hash,
            "track": f"https://testnet.xrpl.org/transactions/{tx_hash}"}

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