"""
RLUSD Trustline utilities for charity wallets
Enhanced with flexible currency support
"""
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import TrustSet
from xrpl.transaction import submit_and_wait
import os

def text_to_hex(text):
    """Convert text to hex with proper padding"""
    if len(text) > 20:
        raise ValueError("Text must be 20 characters or less")
    hex_text = text.encode('ascii').hex().upper()
    return hex_text.ljust(40, '0')

def create_trustline(seed, issuer_address, currency_code, limit_amount="1000000000"):
    """
    Creates a trustline for a specific currency on XRPL testnet
    
    Parameters:
    seed: The seed of the wallet to create the trustline from
    issuer_address: The address of the token issuer
    currency_code: The currency code (e.g., 'USD', 'RLUSD')
    limit_amount: The trust line limit amount (default: 1000000000)
    """
    # Define the network client
    client = JsonRpcClient(os.getenv("XRPL_RPC", "https://s.altnet.rippletest.net:51234"))
    
    # Create wallet from seed
    wallet = Wallet.from_seed(seed)
    
    # Convert currency code to proper hex format
    try:
        if currency_code == "RLUSD":
            # Use the known RLUSD hex
            currency_hex = "524C555344000000000000000000000000000000"
        else:
            currency_hex = text_to_hex(currency_code)
    except ValueError as e:
        print(f"Error: {e}")
        return None, False
    
    # Prepare the trust set transaction
    trust_set_tx = TrustSet(
        account=wallet.classic_address,
        limit_amount={
            "currency": currency_hex,
            "issuer": issuer_address,
            "value": str(limit_amount)
        }
    )
    
    print("\n=== Creating Trustline ===")
    print(f"Account: {wallet.classic_address}")
    print(f"Currency (original): {currency_code}")
    print(f"Currency (hex): {currency_hex}")
    print(f"Issuer: {issuer_address}")
    print(f"Limit: {limit_amount}")
    
    try:
        # Submit and wait for validation
        response = submit_and_wait(trust_set_tx, client, wallet)
        
        # Check the result
        if response.is_successful():
            print("\nTrustline created successfully!")
            print(f"Transaction hash: {response.result['hash']}")
            return response.result['hash'], True
        else:
            print("\nFailed to create trustline")
            error_msg = response.result.get('engine_result_message', 'Unknown error')
            print(f"Error: {error_msg}")
            return None, False
            
    except Exception as e:
        print(f"\nError creating trustline: {str(e)}")
        return None, False
    
    print("==============================\n")

def create_rlusd_trustline(seed, issuer_address="rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV", limit="1000000"):
    """
    Creates a trustline for RLUSD on a wallet (wrapper for backward compatibility)
    
    Parameters:
    seed: The seed of the wallet to create trustline for
    issuer_address: The address of the RLUSD issuer (defaults to Ripple testnet issuer)
    limit: Maximum RLUSD the wallet can hold (defaults to 1,000,000)
    """
    return create_trustline(seed, issuer_address, "RLUSD", limit)

def setup_charity_trustlines():
    """
    Sets up RLUSD trustlines for all configured charity wallets
    """
    print("Setting up RLUSD trustlines for charity wallets...\n")
    
    charities = {
        "MEDA": os.getenv("MEDA_WALLET_SEED"),
        "TARA": os.getenv("TARA_WALLET_SEED")
    }
    
    # Also setup platform wallet if it exists
    platform_seed = os.getenv("PLATFORM_WALLET_SEED")
    if platform_seed:
        charities["PLATFORM"] = platform_seed
    
    results = {}
    
    for charity_name, seed in charities.items():
        if not seed:
            print(f"❌ {charity_name}: No wallet seed configured")
            results[charity_name] = False
            continue
            
        print(f"Setting up trustline for {charity_name}...")
        tx_hash, success = create_rlusd_trustline(seed)
        
        if success:
            print(f"✅ {charity_name}: Trustline created successfully")
            results[charity_name] = True
        else:
            print(f"❌ {charity_name}: Trustline creation failed")
            results[charity_name] = False
    
    print("\n=== Trustline Setup Summary ===")
    for charity, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{charity}: {status}")
    print("===============================\n")
    
    return results

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "create_trustline":
            if len(sys.argv) < 5:
                print("Usage: python trustline_utils.py create_trustline <seed> <issuer> <currency> [limit]")
                print("Example: python trustline_utils.py create_trustline sEd... rQhW... RLUSD 1000000")
                sys.exit(1)
                
            seed = sys.argv[2]
            issuer = sys.argv[3]
            currency = sys.argv[4]
            limit = sys.argv[5] if len(sys.argv) > 5 else "1000000000"
            
            tx_hash, success = create_trustline(seed, issuer, currency, limit)
            if success:
                print(f"Trustline created: {tx_hash}")
            else:
                print("Trustline creation failed")
                
        elif command == "create_rlusd_trustline":
            if len(sys.argv) < 3:
                print("Usage: python trustline_utils.py create_rlusd_trustline <seed> [limit]")
                sys.exit(1)
                
            seed = sys.argv[2]
            limit = sys.argv[3] if len(sys.argv) > 3 else "1000000"
            
            tx_hash, success = create_rlusd_trustline(seed, limit=limit)
            if success:
                print(f"RLUSD Trustline created: {tx_hash}")
            else:
                print("RLUSD Trustline creation failed")
                
        elif command == "setup_all":
            setup_charity_trustlines()
            
    else:
        print("Available commands:")
        print("  create_trustline <seed> <issuer> <currency> [limit] - Create trustline for any currency")
        print("  create_rlusd_trustline <seed> [limit] - Create RLUSD trustline for a wallet")
        print("  setup_all - Setup RLUSD trustlines for all configured charity wallets")
        print("\nExamples:")
        print("  python trustline_utils.py create_trustline sEd... rQhW... USD 1000000")
        print("  python trustline_utils.py create_rlusd_trustline sEd... 1000000")
