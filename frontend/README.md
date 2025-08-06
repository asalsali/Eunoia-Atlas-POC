# Eunoia Atlas Frontend

A modern React TypeScript application for the Eunoia Atlas charitable giving platform.

## Features

- **Dashboard**: Overview of donation statistics and charity performance
- **Donation Form**: Easy-to-use form for making donations to partner charities
- **Analytics**: Comprehensive charts and data visualization
- **Real-time Updates**: Live data from the backend API
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Chart.js** with react-chartjs-2 for data visualization
- **Lucide React** for icons
- **Axios** for API communication
- **CSS3** with modern styling

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── Dashboard.tsx   # Main dashboard
│   ├── DonationForm.tsx # Donation form
│   └── Analytics.tsx   # Analytics page
├── services/           # API services
│   └── api.ts         # API communication
├── App.tsx            # Main app component
├── index.tsx          # Entry point
└── index.css          # Global styles
```

## API Integration

The frontend communicates with the backend API endpoints:

- `GET /totals` - Get donation totals by charity
- `POST /donate` - Make a donation
- `POST /payout/{charity}` - Request payout for charity

## Development

### Adding New Components

1. Create a new component in `src/components/`
2. Add corresponding CSS file
3. Import and use in `App.tsx`

### Styling

The app uses CSS modules and custom CSS classes. The design follows a modern gradient theme with:

- Primary colors: `#667eea` to `#764ba2`
- Success color: `#10b981`
- Error color: `#ef4444`

### Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:8000
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `build/` folder to your hosting service.

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test thoroughly before submitting changes 