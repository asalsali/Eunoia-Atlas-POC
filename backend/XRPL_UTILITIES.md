# XRPL Utilities for Eunoia Atlas

This directory contains enhanced XRPL utilities based on the provided scripts for managing wallets, trustlines, and RLUSD transactions.

## 🚀 New Utilities Added

### `wallet_utils.py` - Wallet Management
- **`create_test_wallet()`** - Creates and funds a new test wallet
- **`send_rlusd()`** - Sends RLUSD between wallets
- **`create_charity_wallet()`** - Creates wallets specifically for charities

### `trustline_utils.py` - Trustline Management  
- **`text_to_hex()`** - Converts currency codes to XRPL hex format
- **`create_trustline()`** - Creates trustlines for any currency (flexible)
- **`create_rlusd_trustline()`** - Creates RLUSD trustlines for wallets (legacy wrapper)
- **`setup_charity_trustlines()`** - Sets up trustlines for all configured charities

### `xrpl_admin.py` - Interactive Administration
- Interactive menu for managing XRPL operations
- Configuration display
- Batch operations for charity setup

## 📋 Usage Examples

### Create a New Charity Wallet
```bash
docker-compose exec api python wallet_utils.py create_charity NEWCHARITY
```

### Setup RLUSD Trustlines
```bash
docker-compose exec api python trustline_utils.py setup_all
```

### Create Custom Currency Trustline
```bash
docker-compose exec api python trustline_utils.py create_trustline <seed> <issuer> <currency> [limit]
# Example: Create USD trustline
docker-compose exec api python trustline_utils.py create_trustline sEd... rIssuer... USD 1000000
```

### Send Test RLUSD Payment
```bash
docker-compose exec api python wallet_utils.py send_rlusd <seed> <destination> <amount>
```

### Interactive Administration
```bash
docker-compose exec api python xrpl_admin.py
```

## 🔧 Integration with Existing System

The improved `xrpl_utils.py` now uses:
- Cleaner transaction creation (based on your scripts)
- Proper `send_max` handling for RLUSD conversions
- Better error handling and logging
- Simplified payment structure

## 🏗️ Key Improvements

### Before (Complex Model Objects)
```python
payment_tx = xrpl.models.transactions.Payment(
    account=sender_wallet.classic_address,
    destination=destination_address,
    amount=xrpl.models.amounts.IssuedCurrencyAmount(
        currency="524C555344000000000000000000000000000000",
        issuer="rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV",
        value=str(amount)
    ),
    send_max=xrpl.models.amounts.IssuedCurrencyAmount(...)
)
```

### After (Simple Dictionary, Based on Your Scripts)
```python
rlusd_amount = {
    "currency": "524C555344000000000000000000000000000000",
    "value": str(amount),
    "issuer": "rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV"
}

payment_tx = xrpl.models.transactions.Payment(
    account=sender_wallet.classic_address,
    destination=destination_address,
    amount=rlusd_amount,
    send_max=rlusd_amount
)
```

## ✅ Verified Working Features

- ✅ Real XRPL testnet transactions
- ✅ RLUSD payments with proper `send_max`
- ✅ Transaction hash generation
- ✅ Testnet URL validation
- ✅ WhisperFlow integration
- ✅ Database storage

## 🔗 Test Transaction

Latest successful transaction:
- **Hash**: `82fda88650d5d916206bacea5c513b53164a9d29887e7abea133dd3a4d6d9bbd`
- **URL**: https://testnet.xrpl.org/transactions/82fda88650d5d916206bacea5c513b53164a9d29887e7abea133dd3a4d6d9bbd

## 🎯 What Your Scripts Provided

Your scripts were extremely valuable because they:

1. **Simplified the API** - Used dictionaries instead of complex model objects
2. **Proper RLUSD Handling** - Showed correct `send_max` usage
3. **Clean Architecture** - Separated concerns (wallet creation, payments, trustlines)
4. **Error Handling** - Demonstrated proper XRPL exception handling
5. **Real-World Patterns** - Provided battle-tested approaches
6. **Flexible Currency Support** - `text_to_hex()` enables any currency trustlines
7. **Professional Code Structure** - Clean, readable, and maintainable functions

## 🆕 Latest Enhancements

### Currency Code Conversion
```python
# Convert any currency to XRPL hex format
text_to_hex("USD")    # -> "5553440000000000000000000000000000000000"
text_to_hex("EUR")    # -> "4555520000000000000000000000000000000000"
text_to_hex("BTC")    # -> "4254430000000000000000000000000000000000"
text_to_hex("RLUSD")  # -> "524C555344000000000000000000000000000000"
```

### Flexible Trustline Creation
```python
# Create trustline for any currency
create_trustline(seed, issuer_address, "USD", "1000000")
create_trustline(seed, issuer_address, "BTC", "100")
create_trustline(seed, issuer_address, "CUSTOM", "50000")
```

The integration of your scripts has made the XRPL functionality much more robust and maintainable! 🚀
