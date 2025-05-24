# UBEX Exchange

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/ubex-exchange.git
cd ubex-exchange
```

2. Install dependencies
```bash
npm install
```

3. Copy `.env.example` to `.env` and update the values
```bash
cp .env.example .env
```

### Backend
Run `npm run start:backend` (or `node server.js`) to launch the backend on port `3035`.
If the backend is not running, the React frontend will encounter WebSocket and API timeout errors.

### Database
The backend uses **MySQL** with Sequelize. Configure credentials in the `.env` file (`DB_USER`, `DB_PASS`, `DB_NAME`, `DB_HOST`).
Start MySQL before running the backend.

After running the database migrations you can seed some demo data:

```bash
npm run seed
```

### Frontend
Run `npm run start:frontend` to start the React app.

### Development
Run both frontend and backend concurrently:
```bash
npm run dev
```

## Features
- Real-time cryptocurrency trading
- WebSocket-based price updates
- Order book visualization
- Trading history
- User authentication

## Project Structure
```
ubex-exchange/
├── backend/           # Backend server code
├── src/              # Frontend React code
│   ├── components/   # React components
│   ├── contexts/     # React contexts
│   ├── services/     # API and WebSocket services
│   └── utils/        # Utility functions
└── public/           # Static files
```

For styling guidelines see [docs/design-guide.md](docs/design-guide.md).

## Error Handling
The application includes error boundaries to gracefully handle runtime errors. If you encounter any issues:
1. Check the browser console for error messages
2. Ensure both backend and frontend servers are running
3. Verify WebSocket connection status
4. Check API endpoint responses

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Important Notes

- The backend server must be running on port 3035 for the frontend to function properly
- WebSocket connections and API requests will timeout if the backend is not available
- Make sure to start the backend server before starting the frontend application 