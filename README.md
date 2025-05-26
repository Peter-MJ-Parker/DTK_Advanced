# DevToolkit Advanced

## Overview

The **DTK_Advanced** package is a comprehensive all-in-one Discord Bot and handler.

## Features

- **Code Templates**: Predefined templates for common programming tasks.
- **Automation Scripts**: Scripts to automate repetitive tasks.
- **Configuration Files**: Ready-to-use configurations for popular tools.
- **Cross-Platform Support**: Compatible with Windows, macOS, and Linux.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Peter-MJ-Parker/DevToolkit-Advanced.git
   ```
2. Navigate to the project directory:
   ```bash
   cd DTK_Advanced
   ```
3. Install dependencies (if applicable):
   ```bash
   npm install
   ```
4. Rename `.env.ex` to `.env`.
5. Fill in `.env` with your secrets:
   ```bash
   DISCORD_TOKEN=YOUR_DISCORD_TOKEN #Your Client Bot Token
   APP_ID=CLIENT_APP_ID #Your Client Application ID
   MONGO_DB_URL=mongodb://localhost:27017/your_database #Your Mongo DB Connection String
   DEV_GUILD_ID=123456789 #Your Main/Testing Server ID
   BOT_OWNER_ID=123456789 #Your User ID
   PREFIX=! #Your desired prefix for text commands - Message commands will not be available without this!
   ```
6. Optionally, fill in discloud.config variables:
   This is to kost the bot with ease on [Discloud](https://discloud.com)
   ```bash
   ID=12345 #This is your client app id that you put in your `.env`
   NAME=DevToolKit #Replace with your bots username
   AVATAR= #Grab the link to your bots profile picture
   AUTORESTART= #true or false (default: false)
   ```

### Discord Avatar Link:

[![Toolscord](https://toolscord.com/logo.webp?size=520)](https://toolscord.com)

## Usage

1. Run the main script:
   ```bash
   npm run start
   ```
2. If you want the bot to auto-restart use nodemon:
   ```bash
   npm run install
   ```
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is not licensed! You may use and modify to your liking as well as republish as your own.

## Contact

For questions or feedback, please reach out to [Not So Marv](https://discord.com/users/371759410009341952).
