# Eunoia Atlas POC

A privacy-preserving charitable giving platform that uses blockchain and federated learning to protect donor privacy while enabling charities to collaborate.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Xumm API credentials (for payment processing)

### Get Started in 3 Steps

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd Eunoia-Atlas-POC
   cp .env.template .env
   ```

2. **Configure Xumm API**
   - Get your Xumm API credentials from [Xumm Developer Console](https://apps.xumm.dev/)
   - Update `.env` with your API key and secret:
     ```
     REACT_APP_XUMM_API_KEY=your-xumm-api-key
     REACT_APP_XUMM_API_SECRET=your-xumm-api-secret
     ```

3. **Start the platform**
   ```bash
   docker-compose up -d
   ```

4. **Open the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs

## 🎯 What It Does

### For Donors
- **Privacy-First**: Your identity is protected through cryptographic hashing
- **Transparent**: All donations are publicly verifiable on the XRPL blockchain
- **Real-time**: Instant confirmation and tracking of your donations
- **Role-Based Views**: Switch between donor, charity staff, and admin perspectives
- **Xumm Integration**: Scan QR codes with Xumm/Xaman for secure payments

### For Charities
- **Collaborative Insights**: Share donor patterns without sharing sensitive data
- **Advanced Analytics**: Federated learning provides predictive insights
- **Privacy Preserved**: Zero personal data is ever shared between organizations
- **Organization Switching**: Toggle between MEDA and TARA views
- **Direct RLUSD Receipt**: Receive payments directly in RLUSD tokens

### For Platform Admins
- **Organization Onboarding**: Add new charities to the platform
- **FL Monitoring**: Real-time federated learning system monitoring
- **Platform Health**: Comprehensive dashboard for system management
- **Multi-Tab Interface**: Overview, Onboarding, FL Monitor, and Organizations tabs

## 🏗️ Architecture

### Core Components
- **Frontend**: React application with role-based views and Xumm integration
- **Backend**: FastAPI server with XRPL integration
- **Database**: PostgreSQL for transaction storage
- **FL System**: Federated learning for privacy-preserving analytics
- **XRPL Listener**: Real-time blockchain transaction monitoring
- **Xumm SDK**: Payment processing and QR code generation

### Services
- `frontend`: React web application (port 3000)
- `api`: FastAPI backend server (port 8000)
- `db`: PostgreSQL database (port 5432)
- `listener`: XRPL transaction listener
- `fl-server`: Federated learning coordination server (port 8080)
- `meda-client`: MEDA federated learning client
- `tara-client`: TARA federated learning client

## 👥 User Views

### 👤 Donor View (Default)
- Platform overview and statistics
- Information about supported charities
- Privacy and transparency features
- Xumm payment integration with QR codes

### 🏢 Charity Staff View
- Organization-specific analytics
- Donor insights and engagement levels
- Federated learning collaboration metrics
- Blockchain transparency features
- RLUSD payment tracking

### ⚙️ Super Admin View
- Platform health monitoring
- Organization onboarding
- Federated learning system management
- Comprehensive analytics dashboard

## 🔧 API Endpoints

### Core Endpoints
- `GET /totals` - Get donation totals by charity
- `GET /scores/{charity}` - Get donor insights for a charity
- `POST /donate` - Process a new donation (legacy)
- `POST /xumm/confirm-payment` - Handle Xumm payment confirmations
- `GET /payout/{charity}` - Get payout information

### Health & Status
- `GET /health` - System health check
- `GET /` - Root endpoint

### Additional Features
- **JSON Schema Validation**: All donation memos validated against `edms_schema.json`
- **CORS Support**: Cross-origin requests enabled for frontend
- **Real-time Monitoring**: XRPL transaction listener for live updates
- **Xumm Integration**: QR code payments with mobile wallet support
- **RLUSD Support**: Native support for Ripple USD tokens

## 📊 Current Data

The platform currently supports:
- **MEDA**: 3 donors, $5,000 total
- **TARA**: 1 donor, $2,500 total
- **FL Clients**: Both online and actively training
- **Privacy Level**: Maximum protection
- **Payment Methods**: Xumm QR codes and direct XRPL transactions

## 🛠️ Development

### Project Structure
```
Eunoia-Atlas-POC/
├── frontend/           # React application with Xumm integration
├── backend/           # FastAPI server
├── docker-compose.yml # Service orchestration
└── .env.template     # Environment configuration
```

### Key Files
- `frontend/src/components/` - React components for different user views
- `frontend/src/services/xummService.ts` - Xumm payment integration
- `backend/main.py` - FastAPI application
- `backend/fl/` - Federated learning implementation
- `backend/sql/` - Database schema and views
- `backend/edms_schema.json` - JSON schema for donation validation
- `backend/xrpl_utils.py` - XRPL integration utilities
- `backend/listener.py` - Real-time transaction monitoring

### Adding Features
1. **Frontend**: Add components in `frontend/src/components/`
2. **Backend**: Add endpoints in `backend/main.py`
3. **Database**: Update schema in `backend/sql/`
4. **Rebuild**: `docker-compose up -d --build`

## 🔒 Privacy & Security

- **Zero Data Sharing**: Charities never share donor data
- **Cryptographic Protection**: Donor identities are hashed
- **Blockchain Transparency**: All transactions are verifiable
- **Federated Learning**: Models trained without data leaving organizations
- **Xumm Security**: Payments processed through secure Xumm infrastructure

## 🐛 Troubleshooting

### Common Issues

**Frontend not loading**
```bash
docker-compose logs frontend
```

**Backend API errors**
```bash
docker-compose logs api
```

**Database issues**
```bash
docker-compose logs db
```

**Xumm payment issues**
- Verify API credentials in `.env`
- Check Xumm Developer Console for payload status
- Ensure RLUSD trust lines are set up

### Reset Everything
```bash
docker-compose down -v
docker-compose up -d --build
```

## 📝 Environment Variables

Copy `.env.template` to `.env` and configure:
- `XRPL_WSS_URL`: XRPL WebSocket URL
- `XRPL_HTTP_URL`: XRPL HTTP API URL
- `POSTGRES_URL`: Database connection string
- `FL_SERVER_HOST`: Federated learning server host
- `BACKEND_HOST`: Backend server host (default: 0.0.0.0)
- `BACKEND_PORT`: Backend server port (default: 8000)
- `REACT_APP_XUMM_API_KEY`: Your Xumm API key
- `REACT_APP_XUMM_API_SECRET`: Your Xumm API secret
- `MEDA_WALLET_ADDRESS`: MEDA charity wallet address
- `TARA_WALLET_ADDRESS`: TARA charity wallet address

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `docker-compose up -d --build`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for privacy-preserving charitable giving** 