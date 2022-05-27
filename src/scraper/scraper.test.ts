import {promises as fs} from 'fs';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config({path: './conf/.env'});

import scrapItemInfoByID from './scraper';
import {Scrape} from '../ts/interfaces/Scrape';

beforeAll(async () => {
  const data = await fs.readFile(path.resolve(__dirname, './test/pksResponse.txt'), 'utf8');
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve(data),
    })
  ) as jest.Mock;
});

describe('Scrape', () => {
  test('Scraping 6685 BSB', async () => {
    const test = await scrapItemInfoByID('6690');

    const file = await fs.readFile(path.resolve(__dirname, './test/pksObject.json'), 'utf8');
    const object: Scrape = JSON.parse(file);
    object.timestamp = Math.floor(new Date().getTime() / 1000);
    expect(test).toEqual(object);
  });

  test('Scrape fail', async () => {
    const test = global.fetch as jest.Mock;
    test.mockReturnValueOnce(
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve(''),
        statusText: 'Blocked',
      })
    ) as jest.Mock;

    expect(async () => {
      await scrapItemInfoByID('6690');
    }).rejects.toThrow('Blocked');
  });

  test('Non-existent ID', async () => {
    const test = global.fetch as jest.Mock;
    test.mockReturnValueOnce(
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(''),
      })
    );

    await expect(async () => {
      await scrapItemInfoByID('6690');
    }).rejects.toThrow('Item not found for ID: 6690');
  });
});
