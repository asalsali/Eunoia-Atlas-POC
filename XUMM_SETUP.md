# Xumm Integration Setup Guide

This guide will help you set up real Xumm API credentials for the Eunoia Atlas POC.

## 🚀 Quick Setup

### 1. Get Xumm API Credentials

1. **Visit Xumm Developer Console**
   - Go to: https://apps.xumm.dev/
   - Sign in with your Xumm account

2. **Create a New App**
   - Click "Create App"
   - Fill in the app details:
     - **Name**: Eunoia Atlas
     - **Description**: Privacy-preserving charitable giving platform
     - **Website**: Your domain (or localhost for development)
     - **Redirect URL**: http://localhost:3000 (for development)

3. **Get Your Credentials**
   - Copy your **API Key** and **API Secret**
   - These will be used in your `.env` file

### 2. Configure Environment Variables

Update your `.env` file with your real credentials:

```bash
# Xumm API Credentials
REACT_APP_XUMM_API_KEY=your-actual-xumm-api-key
REACT_APP_XUMM_API_SECRET=your-actual-xumm-api-secret

# Charity Wallet Addresses (Replace with actual addresses)
MEDA_WALLET_ADDRESS=rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV
TARA_WALLET_ADDRESS=rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV
```

### 3. Set Up Charity Wallets

For production, you'll need real XRPL wallets for MEDA and TARA:

1. **Create XRPL Wallets**
   ```bash
   # Use Xumm to create wallets for each charity
   # Or use XRPL CLI tools
   ```

2. **Set Up RLUSD Trust Lines**
   - Each charity wallet needs a trust line for RLUSD
   - The trust line setup is handled automatically by the app

3. **Update Wallet Addresses**
   - Replace the placeholder addresses in `.env`
   - Use the actual wallet addresses for MEDA and TARA

### 4. Test the Integration

1. **Start the Application**
   ```bash
   docker-compose up -d
   ```

2. **Test a Donation**
   - Go to http://localhost:3000
   - Switch to "Donor View"
   - Click "Donate"
   - Fill out the form
   - Scan the QR code with Xumm/Xaman

3. **Verify Payment**
   - Check the Xumm Developer Console for payload status
   - Verify the transaction on XRPL testnet

## 🔧 Development vs Production

### Development (Current Setup)
- Uses XRPL testnet
- Mock wallet addresses
- Test RLUSD tokens
- No real money involved

### Production Setup
- Use XRPL mainnet
- Real charity wallet addresses
- Real RLUSD tokens
- Actual financial transactions

## 📱 Mobile Testing

1. **Install Xumm/Xaman**
   - Download from App Store/Google Play
   - Create or import a wallet

2. **Test QR Code Scanning**
   - The app generates QR codes for payments
   - Scan with Xumm/Xaman to complete payments

## 🔒 Security Considerations

1. **API Credentials**
   - Never commit `.env` files to version control
   - Use environment variables in production
   - Rotate credentials regularly

2. **Wallet Security**
   - Use hardware wallets for charity funds
   - Implement multi-signature for large amounts
   - Regular security audits

3. **Transaction Monitoring**
   - Monitor all transactions
   - Implement fraud detection
   - Set up alerts for unusual activity

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Verify your API credentials in `.env`
   - Check the Xumm Developer Console
   - Ensure the app is properly configured

2. **QR Code Not Working**
   - Check network connectivity
   - Verify Xumm app is up to date
   - Test with a small amount first

3. **Payment Not Confirming**
   - Check Xumm Developer Console for payload status
   - Verify wallet has sufficient funds
   - Check trust line setup

### Debug Commands

```bash
# Check frontend logs
docker-compose logs frontend

# Check API logs
docker-compose logs api

# Restart services
docker-compose restart frontend api
```

## 📚 Additional Resources

- [Xumm Developer Documentation](https://xumm.readme.io/)
- [XRPL Documentation](https://xrpl.org/docs/)
- [RLUSD Token Information](https://xrpl.org/docs/tokens/)

## 🎯 Next Steps

1. **Get Real API Credentials** from Xumm Developer Console
2. **Update `.env`** with your credentials
3. **Test the Integration** with small amounts
4. **Deploy to Production** when ready
5. **Monitor Transactions** and user feedback

---

**Need Help?** Check the troubleshooting section or refer to the Xumm documentation. 