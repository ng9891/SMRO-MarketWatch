exports.helpMsg = () => {
  return '```Usage: !wl <Commands> [options]\
  \n\nCommands:\
  \n  +[itemID]           Adds a itemID to your watchlist.\
  \n  -[itemID]           Removes a itemID to your watchlist.\
  \n  list                Print list.\
  \n  reset               Resets your list.\
  \n  help                Output this usage information.\
  \n\
  \nOptions:\
  \n  -t, --time          Specifies the Cron time in terms of minutes.\
  \n  -p, --price         Price threshold for notifications.\
  \n                      Add k, m or b for shortcut.\
  \n\
	\nExamples:\
  \n  !wl +32228          Adds itemID to watchlist with default time and price.\
  \n  !wl -32228          Removes itemID from watchlist.\
  \n  !wl +32228 -t=15 -p=50m```';
};
