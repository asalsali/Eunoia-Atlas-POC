#!/usr/bin/env python3
"""
XRPL Administration Script for Eunoia Atlas

This script provides utilities for managing XRPL wallets and trustlines
for the charitable giving platform.
"""
import sys
import os
from wallet_utils import create_charity_wallet, send_rlusd
from trustline_utils import setup_charity_trustlines, create_rlusd_trustline, create_trustline

def print_menu():
    print("\n=== XRPL Administration Menu ===")
    print("1. Create new charity wallet")
    print("2. Setup RLUSD trustlines for all charities")
    print("3. Create RLUSD trustline for specific wallet")
    print("4. Create custom currency trustline")
    print("5. Send test RLUSD payment")
    print("6. Show current configuration")
    print("7. Exit")
    print("================================")

def show_configuration():
    print("\n=== Current XRPL Configuration ===")
    print(f"XRPL RPC: {os.getenv('XRPL_RPC', 'Not set')}")
    print(f"MEDA Wallet Seed: {'SET' if os.getenv('MEDA_WALLET_SEED') else 'NOT SET'}")
    print(f"MEDA Wallet Address: {os.getenv('MEDA_WALLET_ADDRESS', 'Not set')}")
    print(f"TARA Wallet Seed: {'SET' if os.getenv('TARA_WALLET_SEED') else 'NOT SET'}")
    print(f"TARA Wallet Address: {os.getenv('TARA_WALLET_ADDRESS', 'Not set')}")
    print(f"Platform Wallet Seed: {'SET' if os.getenv('PLATFORM_WALLET_SEED') else 'NOT SET'}")
    print("==================================")

def main():
    while True:
        print_menu()
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == '1':
            charity_name = input("Enter charity name: ").strip()
            if charity_name:
                create_charity_wallet(charity_name)
            else:
                print("Invalid charity name")
                
        elif choice == '2':
            print("Setting up RLUSD trustlines for all configured charities...")
            setup_charity_trustlines()
            
        elif choice == '3':
            seed = input("Enter wallet seed: ").strip()
            if seed:
                limit = input("Enter trustline limit (default 1000000): ").strip() or "1000000"
                create_rlusd_trustline(seed, limit=limit)
            else:
                print("Invalid seed")
                
        elif choice == '4':
            seed = input("Enter wallet seed: ").strip()
            issuer = input("Enter issuer address: ").strip()
            currency = input("Enter currency code (e.g., USD, EUR, BTC): ").strip()
            limit = input("Enter trustline limit (default 1000000000): ").strip() or "1000000000"
            
            if seed and issuer and currency:
                tx_hash, success = create_trustline(seed, issuer, currency, limit)
                if success:
                    print(f"✅ Trustline created: {tx_hash}")
                    print(f"🔗 View on testnet: https://testnet.xrpl.org/transactions/{tx_hash}")
                else:
                    print("❌ Trustline creation failed")
            else:
                print("Invalid input")
                
        elif choice == '5':
            seed = input("Enter sender wallet seed: ").strip()
            destination = input("Enter destination address: ").strip()
            amount_str = input("Enter amount to send: ").strip()
            
            if seed and destination and amount_str:
                try:
                    amount = float(amount_str)
                    tx_hash, success = send_rlusd(seed, destination, amount)
                    if success:
                        print(f"✅ Payment successful: {tx_hash}")
                        print(f"🔗 View on testnet: https://testnet.xrpl.org/transactions/{tx_hash}")
                    else:
                        print("❌ Payment failed")
                except ValueError:
                    print("Invalid amount")
            else:
                print("Invalid input")
                
        elif choice == '6':
            show_configuration()
            
        elif choice == '7':
            print("Goodbye!")
            break
            
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--config":
        show_configuration()
    else:
        main()
