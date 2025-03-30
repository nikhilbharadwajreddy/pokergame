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
