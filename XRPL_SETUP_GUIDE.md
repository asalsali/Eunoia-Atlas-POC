# XRPL Setup Guide - Real Blockchain Donations

## 🚀 Complete Implementation for Real XRPL Donations

This guide will help you implement actual blockchain donations to the XRP Ledger (XRPL).

## 📋 Prerequisites

### 1. **XRPL Testnet Access**
- Visit [XRPL Testnet Faucet](https://xrpl.org/xrp-testnet-faucet.html)
- Create testnet accounts for MEDA and TARA charities
- Get testnet XRP for transaction fees

### 2. **RLUSD Token Setup**
- RLUSD is a testnet token for this POC
- Issuer: `rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV`
- Currency Code: `524C555344000000000000000000000000000000`

## 🔧 Step-by-Step Implementation

### Step 1: Generate Real XRPL Wallets

```bash
# Using XRPL CLI or online tools
# Generate wallet seeds for MEDA and TARA charities
```

**Option A: Using XRPL Testnet Faucet**
1. Go to https://xrpl.org/xrp-testnet-faucet.html
2. Generate two testnet accounts
3. Save the seeds securely

**Option B: Using XRPL CLI**
```bash
# Install XRPL CLI
npm install -g xrpl-cli

# Generate wallets
xrpl-cli generate-wallet --network testnet
```

### Step 2: Update Environment Variables

```bash
# Copy the template and update with real values
cp env.template .env

# Edit .env file with your real wallet seeds
MEDA_WALLET_SEED=sEdTM1uX8pu2do5XvTnutH6HsouMaM2  # Replace with real seed
TARA_WALLET_SEED=sEdTM1uX8pu2do5XvTnutH6HsouMaM2  # Replace with real seed
```

### Step 3: Fund the Wallets

```bash
# Use XRPL testnet faucet to fund wallets
# Each wallet needs ~1000 XRP for fees
```

### Step 4: Set Up RLUSD Trust Lines

The wallets need to trust the RLUSD token issuer:

```javascript
// Trust line setup (already implemented in xummService.ts)
const trustLine = {
  TransactionType: "TrustSet",
  Account: wallet.classicAddress,
  LimitAmount: {
    currency: '524C555344000000000000000000000000000000',  // RLUSD
    issuer: 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV',  // Ripple
    value: '100000000'
  }
};
```

## 🎯 Real XRPL Transaction Flow

### 1. **Donor Initiates Payment**
```typescript
// Frontend creates XUMM payload
const payment = await createDonationPayment(
  destination,    // Charity wallet address
  transactionId,  // Unique transaction ID
  amount,         // Donation amount
  charity,        // "MEDA" or "TARA"
  causeId         // Cause identifier
);
```

### 2. **XUMM Handles Signing**
- Donor scans QR code with XUMM app
- XUMM app signs the transaction
- Transaction is submitted to XRPL

### 3. **Backend Confirms Payment**
```typescript
// Backend receives confirmation
await confirm_xumm_payment({
  payload_id: "xumm-payload-id",
  transaction_hash: "real-xrpl-tx-hash",
  charity: "MEDA",
  cause_id: "cause-123",
  amount: 50.0
});
```

### 4. **Database Records Transaction**
```sql
-- Transaction is saved with real XRPL hash
INSERT INTO donations (tx, data) VALUES (
  'real-xrpl-transaction-hash',
  '{"cid": "cause-123", "chr": "MEDA", "amt": 50.0, ...}'
);
```

## 🔍 Testing Real XRPL Transactions

### 1. **Testnet Explorer**
- View transactions: https://testnet.xrpl.org/
- Search by transaction hash
- Verify memo data

### 2. **XRPL CLI Testing**
```bash
# Check wallet balance
xrpl-cli account-info --account rMEDA_WALLET_ADDRESS --network testnet

# Check trust lines
xrpl-cli account-lines --account rMEDA_WALLET_ADDRESS --network testnet
```

### 3. **Backend Logs**
```bash
# Monitor real transaction logs
docker-compose logs backend | grep "Real XRPL transaction"
```

## 🛡️ Security Considerations

### 1. **Wallet Security**
- Store seeds securely (use environment variables)
- Never commit seeds to version control
- Use different wallets for testnet/mainnet

### 2. **Transaction Validation**
- Validate all transaction data
- Check memo format against schema
- Verify charity addresses

### 3. **Error Handling**
- Graceful fallbacks for failed transactions
- Retry logic for network issues
- Clear error messages for users

## 🚨 Troubleshooting

### **Common Issues:**

1. **"Insufficient XRP" Error**
   - Fund wallets with more testnet XRP
   - Check transaction fees

2. **"Invalid Trust Line" Error**
   - Ensure trust lines are set up
   - Check RLUSD issuer address

3. **"Transaction Failed" Error**
   - Check XRPL network status
   - Verify wallet seeds are correct
   - Ensure sufficient XRP for fees

### **Debug Commands:**
```bash
# Check wallet status
docker-compose exec backend python -c "
import os
from xrpl_utils import get_wallets
wallets = get_wallets()
for charity, wallet in wallets.items():
    print(f'{charity}: {wallet.classic_address}')
"

# Test XRPL connection
docker-compose exec backend python -c "
from xrpl_utils import CLIENT
print(CLIENT.request('server_info'))
"
```

## 📊 Monitoring Real Transactions

### 1. **Transaction Tracking**
```typescript
// Real transaction URLs
const txUrl = `https://testnet.xrpl.org/transactions/${txHash}`;
```

### 2. **Backend Monitoring**
```python
# Monitor successful transactions
print(f"Real XRPL transaction successful: {tx_hash}")
print(f"Track at: https://testnet.xrpl.org/transactions/{tx_hash}")
```

### 3. **Database Verification**
```sql
-- Check real transactions
SELECT tx, data->>'chr' as charity, data->>'amt' as amount 
FROM donations 
WHERE tx NOT LIKE 'mock%';
```

## 🎯 Next Steps

1. **Get Real XRPL Wallets**: Generate testnet wallets for MEDA and TARA
2. **Update Environment**: Add real wallet seeds to `.env`
3. **Test Transactions**: Make small test donations
4. **Monitor Results**: Verify transactions on testnet explorer
5. **Scale Up**: Move to mainnet when ready

## 🔗 Useful Links

- [XRPL Testnet Faucet](https://xrpl.org/xrp-testnet-faucet.html)
- [XRPL Testnet Explorer](https://testnet.xrpl.org/)
- [XUMM Developer Console](https://apps.xumm.dev/)
- [XRPL Documentation](https://xrpl.org/docs/)

---

**With these steps, you'll have real blockchain donations working on the XRP Ledger!** 🚀 