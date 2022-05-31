# SMRO - MarketWatch
A Discord Bot to check for new item listing in the market below users defined thresholds.

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

## Limitations
To avoid flooding SMRO servers, scrapper is only limited to the `first page` of the vending information.

Currently, the bot cannot track items with enchants on equipments such as: a PKS with 50% armor penetration, etc. and also, can only track one refine rate per item eg. Cannot track 2 PKS's of +12 and +11 refine rates. This is going to be a TODO feature.

## Disclaimer
Information are gathered by web scrapping the SMRO website. We are not responsible if you get denied access to their servers for excessive requests. 

Moreover, SMRO website is subject to changes and might break the application. I will try to keep it as updated as possible.

If your Discord server has a lot of users with a watchlist, you might need to manage your firebase budget.

## Technical Stuffs
You are free to tweak some parameters in the `.env` configuration file. However, keep in mind that information are queried by web scrapping the SMRO website and `we are not responsible if you get banned`.
### Commands
- Add / Update list item
- Delete an item from the list
- Display your list.
- Display running scrape jobs.
- Update scraping time for an item. `Limited to server admins.`
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

Note: In theory, this does not guarantee uniqueness. Thus, there is a low chance users will not get notified of new vendings as SMRO could recycle shop ID's. To put a bandaid on this problem, I put a limit on how many days the Bot could query the history collection, which could be tweaked on the `.env` file.

### Example of Vending Info object
![scrape](https://storage.googleapis.com/picboi-39298.appspot.com/final/vv5gBs1B_1000x800)

Author: vT