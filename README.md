# Eunoia Atlas POC

A proof-of-concept implementation for federated learning on the XRPL (XRP Ledger) with privacy-preserving data aggregation and secure model training.

## Overview

Eunoia Atlas POC demonstrates a novel approach to federated learning that integrates with blockchain technology, specifically the XRPL. The system enables distributed machine learning while preserving data privacy and leveraging blockchain for secure coordination.

## Architecture

### Backend Components

- **XRPL Integration**: Real-time transaction monitoring and blockchain data processing
- **Federated Learning Server**: Coordinates distributed model training across multiple clients
- **MEDA Client**: Multi-Entity Data Aggregation client for standard federated learning
- **TARA Client**: Trusted Aggregation and Risk Assessment client with enhanced security
- **Database**: PostgreSQL for storing transaction data and model metadata

### Key Features

- **Real-time XRPL Monitoring**: Live transaction tracking and analysis
- **Privacy-Preserving Federated Learning**: Secure model aggregation without data sharing
- **Differential Privacy**: Noise addition for enhanced privacy protection
- **Risk Assessment**: Automated risk evaluation and mitigation strategies
- **Blockchain Integration**: Leveraging XRPL for decentralized coordination

## Project Structure

```
eunoia-poc/
├─ .env.template          # Environment configuration template
├─ docker-compose.yml     # Docker services configuration
├─ backend/
│   ├─ requirements.txt   # Python dependencies
│   ├─ main.py           # FastAPI application entry point
│   ├─ xrpl_utils.py     # XRPL client utilities
│   ├─ listener.py       # Real-time transaction listener
│   ├─ sql/seed.sql      # Database schema and initialization
│   └─ fl/               # Federated Learning modules
│       ├─ server.py     # FL coordination server
│       ├─ meda_client.py # MEDA client implementation
│       └─ tara_client.py # TARA client with security features
└─ frontend/             # Frontend application (future development)
```

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Python 3.8+
- PostgreSQL (handled by Docker)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eunoia-poc
   ```

2. **Configure environment**
   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

3. **Start services with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

1. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL database**
   ```bash
   # Run the seed.sql script to initialize the database
   psql -h localhost -U eunoia_user -d eunoia_db -f sql/seed.sql
   ```

3. **Start the backend server**
   ```bash
   python main.py
   ```

## API Endpoints

### Health and Status
- `GET /` - Root endpoint
- `GET /health` - Health check with XRPL connection status

### XRPL Integration
- `GET /account/{address}` - Get account information
- `GET /transactions/{address}` - Get recent transactions

### Federated Learning
- `POST /fl/register` - Register FL client
- `POST /fl/unregister` - Unregister FL client
- `POST /fl/model-update` - Submit model update
- `GET /fl/global-model` - Get current global model
- `GET /fl/status` - Get FL server status

## Federated Learning Clients

### MEDA Client
- Standard federated learning client
- Basic privacy protection
- Suitable for general use cases

### TARA Client
- Enhanced security features
- Differential privacy implementation
- Risk assessment and mitigation
- Cryptographic model protection

## Configuration

### Environment Variables

- `XRPL_WSS_URL`: WebSocket URL for XRPL connection
- `XRPL_HTTP_URL`: HTTP URL for XRPL API
- `DATABASE_URL`: PostgreSQL connection string
- `BACKEND_HOST`: Backend server host
- `BACKEND_PORT`: Backend server port

### Federated Learning Settings

- `MIN_CLIENTS`: Minimum clients for model aggregation
- `AGGREGATION_THRESHOLD`: Number of updates before aggregation
- `PRIVACY_BUDGET`: Differential privacy budget
- `RISK_THRESHOLD`: Risk assessment threshold

## Development

### Adding New Features

1. **XRPL Integration**: Extend `xrpl_utils.py` for new blockchain features
2. **Federated Learning**: Modify FL clients in `backend/fl/`
3. **Database**: Update schema in `sql/seed.sql`
4. **API**: Add new endpoints in `main.py`

### Testing

```bash
# Run backend tests
cd backend
python -m pytest

# Test XRPL connection
python -c "from xrpl_utils import XRPLClient; print('XRPL connection test')"
```

## Security Considerations

- **Data Privacy**: All training data remains local to clients
- **Model Protection**: Cryptographic signatures for model updates
- **Risk Assessment**: Automated risk evaluation and mitigation
- **Differential Privacy**: Noise addition for privacy preservation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- XRPL Foundation for blockchain integration
- Federated Learning research community
- Privacy-preserving machine learning researchers 