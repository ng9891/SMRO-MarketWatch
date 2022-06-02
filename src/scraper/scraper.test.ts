import {promises as fs} from 'fs';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config({path: './conf/.env'});

import {scrapeItem} from './scraper';
import {Scrape} from '../ts/interfaces/Scrape';

describe.skip('Scrape HEL', () => {
  beforeAll(async () => {
    const data = await fs.readFile(path.resolve(__dirname, './mocks/pksResponse.txt'), 'utf8');
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(data),
      })
    ) as jest.Mock;
  });

  test('Scraping 28946 PKS', async () => {
    const test = await scrapeItem('28946', 'test', 'HEL');
    // await fs.writeFile(path.resolve(__dirname, './mocks/pksObject.json'), JSON.stringify(test));
    const file = await fs.readFile(path.resolve(__dirname, './mocks/pksObject.json'), 'utf8');
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
      await scrapeItem('6690', 'test', 'HEL');
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
      await scrapeItem('6690', 'test', 'HEL');
    }).rejects.toThrow('No item found for: 6690:test in HEL');
  });
});

describe.skip('Scrape NIF', () => {
  beforeAll(async () => {
    const data = await fs.readFile(path.resolve(__dirname, './mocks/nif_ADResponse.txt'), 'utf8');
    const itemInfo = await fs.readFile(path.resolve(__dirname, './mocks/nif_ADInfoResponse.txt'), 'utf8');
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(data),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(itemInfo),
        })
      )
      .mockImplementation(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(data),
        })
      ) as jest.Mock;
  });

  jest.setTimeout(10000)
  test('Scraping 15204 Abyss Dress', async () => {
    const test = await scrapeItem('15204', 'Abyss Dress', 'NIF');
    // await fs.writeFile(path.resolve(__dirname, './mocks/nif_AD5.json'), JSON.stringify(test));
    const file = await fs.readFile(path.resolve(__dirname, './mocks/nif_AD4.json'), 'utf8');
    const object: Scrape = JSON.parse(file);
    object.timestamp = Math.floor(new Date().getTime() / 1000);
    expect(test).toEqual(object);
  });
});
