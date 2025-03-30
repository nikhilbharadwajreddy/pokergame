# Poker Game Settlement App

A web application for tracking poker games and calculating settlements between players.

## Features

- User accounts and authentication
- Create and manage poker games
- Add players to games with buy-ins
- Track chips and calculate settlements
- Admin dashboard for system management

## Deployment on Fly.io

### Prerequisites

- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
- Fly.io account
- MongoDB Atlas account (or other MongoDB provider)

### Deployment Steps

1. **Login to Fly.io**

```bash
fly auth login
```

2. **Initialize the App (First time only)**

```bash
fly launch
```

This will create a new app on Fly.io. You can use existing configuration.

3. **Set Up Environment Variables**

Create a `secrets.toml` file from the example:

```bash
cp secrets.example.toml secrets.toml
```

Edit `secrets.toml` with your actual MongoDB connection details and other secrets.

4. **Import Secrets**

```bash
fly secrets import --app pokersettle < secrets.toml
```

5. **Create Volume (First time only)**

```bash
fly volumes create pokersettle_data --size 1
```

6. **Deploy the Application**

```bash
fly deploy
```

7. **Monitor the Deployment**

```bash
fly status
fly logs
```

8. **Open the Application**

```bash
fly open
```

## Local Development

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/pokergame.git
cd pokergame
```

2. **Set up a virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Set environment variables**

Create a `.env` file from the example:

```bash
cp .env.example .env
# Edit .env with your actual values
```

Key environment variables include:
- `MONGO_URI`: Your MongoDB connection string
- `SECRET_KEY`: Secret key for session security
- `ADMIN_PASSWORD`: Password for admin access

5. **Run the application**

```bash
python app.py
```

The application will be available at http://localhost:5000

## Secrets Management

This application uses a centralized secrets management approach:

1. **Local Development**: Secrets are stored in a `.env` file
2. **Production/Fly.io**: Secrets are managed using Fly.io's secrets mechanism

### Adding New Secrets

If you need to add a new configuration value or secret:

1. Add it to `utils/config.py`
2. Update `.env.example` and `secrets.example.toml`
3. Update your local `.env` and server secrets

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# Poker Settle

A web application for managing poker games and calculating settlements between players.

## Project Structure

This project follows a modular architecture for better code organization and maintainability:

### Backend Structure:

- `app.py` - Main entry point for the Flask application
- `models/` - Data models
  - `user.py` - User data operations
  - `game.py` - Game management logic
  - `settlement.py` - Settlement calculation logic
- `routes/` - API endpoints
  - `auth.py` - Authentication routes
  - `dashboard.py` - Dashboard routes
  - `game.py` - Game management routes
  - `admin.py` - Admin panel routes
- `utils/` - Utility functions
  - `mongodb.py` - Database connection handling

### Frontend Structure:

- `templates/` - HTML templates
  - `base.html` - Base template with common layout
  - `components/` - Reusable UI components
    - `header.html` - Page header
    - `player_form.html` - Add player form
    - `group_form.html` - Add group form
    - `player_table.html` - Player list table
    - `settlement_modal.html` - Settlement results modal
  - Other page templates
- `static/` - Static assets
  - `css/styles.css` - Application styles
  - `js/` - JavaScript files
    - `game.js` - Game page functionality
    - `settlement.js` - Settlement calculations and display

## Running the Application

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the application:
   ```
   python app.py
   ```

3. Access the application at `http://localhost:5000`

## Development

1. Make sure MongoDB is running or set the appropriate environment variables:
   ```
   export MONGO_USERNAME=your_username
   export MONGO_PASSWORD=your_password
   export MONGO_URI=your_connection_string
   ```

2. For admin access, set:
   ```
   export ADMIN_PASSWORD=your_admin_password
   ```

## Contributors

- Nikhil and Praneeth
