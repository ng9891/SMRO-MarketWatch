#!/bin/bash
# This is a batch script to run rclone to synchronize Google Drive iteminfo.lua to local /assets/iteminfo.lua
# Purpose is to allow other users to update the item-query autocomplete while dev is not available.
# parseLua.ts will do the job on parsing the lua file to json.
# Requires jq and rclone with permissions to your GDrive. Remember to change directory.
date=$(date '+%d/%m/%Y %H:%M:%S')
TEST=$(rclone check --one-way --use-json-log smro-marketwatch-iteminfo:smro/iteminfo.lua /home/vt/code/SMRO-MarketWatch/dist/assets/ 2>&1 | jq '.msg' | head -n1)
if [ "$TEST" = '"0 differences found"' ]; then
  echo "${date}: No changes on iteminfo.lua" >> /home/vt/logs/smro-iteminfo.log
else
  echo "${date}: Change detected. Downloading file..." >> /home/vt/logs/smro-iteminfo.log
  rclone copy smro-marketwatch-iteminfo:smro/iteminfo.lua /home/vt/code/SMRO-MarketWatch/dist/assets/
  echo "Finished Downloading." >> /home/vt/logs/smro-iteminfo.log
  echo "Parsing..." >> /home/vt/logs/smro-iteminfo.log
  node /home/vt/code/SMRO-MarketWatch/dist/helpers/parseLua.js >> /home/vt/logs/smro-iteminfo.log
  echo "${date}: Finished Parsing" >> /home/vt/logs/smro-iteminfo.log
fi
