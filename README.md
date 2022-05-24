# SMRO - MarketWatch
A Discord Bot to check for new item listing in the market bellow users defined thresholds.

The purpose of this App is to notify users of a sale/deal in the SMRO market. Players can focus on playing (or not to play) the game and won't have to worry about missing a deal for an item they want to buy ever!

## Getting started:
### Discord Bot configuration
Allow the bot to have the following scopes/permissions:

- Scopes: `bot, applications.commands`
- Permissions: `Read Messages, send messages, embed links, use slash commands`
  
### Configure the App
1. Rename `conf/.env-boilerplate` to `.env`
   
2. Add your `DISCORD_TOKEN`, `DISCORD_GUILD_ID` and `DISCORD_CLIENT_ID`
3. Add your `Firestore service account key` in the folder `./src/db/serviceAccount.json`
   
4.  Run 
    ```bash
    npm i --only=prod 
    ``` 
    For devs, just: 
    ```bash 
    npm i
    ```

### Start up SMRO-MarketWatch
```bash
npm start
```
## Disclaimer
Information are gathered by web scrapping the SMRO website. We are not responsible if you get denied access to their server for excessive requests. 

Moreover, SMRO website is subject to changes and might break the application. I will try to keep it as updated as possible.

## Technical Stuffs
You are free to tweak some parameters in the `.env` configuration file. However, keep in mind that information are queried by web scrapping the SMRO website and `we are not responsible if you get banned`.
### Commands
- Add / Update list item
- Delete item from the list
- Change query time for an item
- List your list.
- Help
### Developed using:
- Typescript
- Discord API
- Firebase
- Cheerio
- Date-Fns
- Node-schedule
- Jest
### Database Schema
A rough diagram of the structure of the database.
![schema](https://storage.googleapis.com/picboi-39298.appspot.com/final/mYTcu7sO_1000x800)

### Idea behind the watchlist
A history collection is retained to keep track of what is seen already in the market. Users will only be notified of items that are new to the market and will not be informed again for the same listing.

To keep track of vending records, a hash is made for each unique listing using:
- Item ID
- Item price
- Shop ID
- Shop Name

Note: in theory, this does not guarantee uniqueness. So, there is low chance users can get notified of the same vending as SMRO could recycle shop ID's.

Author: vT