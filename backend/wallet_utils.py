"""
XRPL Wallet utilities for the Eunoia Atlas platform
"""
from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet, Wallet
from xrpl.models.transactions import Payment
from xrpl.transaction import submit_and_wait
import os

def create_test_wallet():
    """
    Creates and funds a new test wallet on XRPL testnet
    """
    # Define the network client
    client = JsonRpcClient(os.getenv("XRPL_RPC", "https://s.altnet.rippletest.net:51234"))
    
    # Create a test wallet with test XRP
    test_wallet = generate_faucet_wallet(client)
    
    # Print wallet details
    print("\n=== XRPL Test Wallet Details ===")
    print(f"Public Key: {test_wallet.public_key}")
    print(f"Private Key: {test_wallet.private_key}")
    print(f"Classic Address: {test_wallet.classic_address}")
    print(f"Seed: {test_wallet.seed}")
    print("==============================\n")
    
    return test_wallet

def send_rlusd(seed, destination_address, amount, issuer_address="rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV"):
    """
    Sends RLUSD from a wallet to a destination address
    
    Parameters:
    seed: The seed of the sending wallet
    destination_address: The address to send RLUSD to
    amount: Amount of RLUSD to send
    issuer_address: The address of the RLUSD issuer (defaults to Ripple testnet issuer)
    """
    # Define the network client
    client = JsonRpcClient(os.getenv("XRPL_RPC", "https://s.altnet.rippletest.net:51234"))
    
    # Create wallet from seed
    wallet = Wallet.from_seed(seed)
    
    # Convert currency code to hex
    currency_hex = "524C555344000000000000000000000000000000"  # Hex for "RLUSD"
    
    # Prepare payment transaction
    rlusd_amount = {
        "currency": currency_hex,
        "value": str(amount),
        "issuer": issuer_address
    }
    
    payment = Payment(
        account=wallet.classic_address,
        amount=rlusd_amount,
        send_max=rlusd_amount,  # Required for RLUSD conversions
        destination=destination_address
    )
    
    print("\n=== Sending RLUSD ===")
    print(f"From: {wallet.classic_address}")
    print(f"To: {destination_address}")
    print(f"Amount: {amount} RLUSD")
    print(f"Issuer: {issuer_address}")
    
    try:
        # Submit and wait for validation
        response = submit_and_wait(payment, client, wallet)
        
        # Check the result
        if response.is_successful():
            print("\nPayment successful!")
            print(f"Transaction hash: {response.result['hash']}")
            return response.result['hash'], True
        else:
            print("\nPayment failed")
            error_msg = response.result.get('engine_result_message', 'Unknown error')
            print(f"Error: {error_msg}")
            return None, False
            
    except Exception as e:
        print(f"\nError sending payment: {str(e)}")
        return None, False
    
    print("==============================\n")

def create_charity_wallet(charity_name):
    """
    Creates a new wallet for a charity and returns the wallet details
    """
    print(f"\nCreating wallet for {charity_name}...")
    wallet = create_test_wallet()
    
    # Print formatted output for environment variables
    print(f"\n=== Environment Variables for {charity_name.upper()} ===")
    print(f"{charity_name.upper()}_WALLET_SEED={wallet.seed}")
    print(f"{charity_name.upper()}_WALLET_ADDRESS={wallet.classic_address}")
    print("============================================\n")
    
    return wallet

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "create_wallet":
            print("Creating and funding a test wallet...")
            test_wallet = create_test_wallet()
            print("Done!")
            
        elif command == "create_charity":
            charity_name = sys.argv[2] if len(sys.argv) > 2 else "TEST"
            create_charity_wallet(charity_name)
            
        elif command == "send_rlusd":
            if len(sys.argv) < 5:
                print("Usage: python wallet_utils.py send_rlusd <seed> <destination> <amount>")
                sys.exit(1)
            
            seed = sys.argv[2]
            destination = sys.argv[3]
            amount = float(sys.argv[4])
            
            tx_hash, success = send_rlusd(seed, destination, amount)
            if success:
                print(f"Transaction successful: {tx_hash}")
            else:
                print("Transaction failed")
    else:
        print("Available commands:")
        print("  create_wallet - Create a new test wallet")
        print("  create_charity <name> - Create a wallet for a charity")
        print("  send_rlusd <seed> <destination> <amount> - Send RLUSD")
