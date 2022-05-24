import {promises as fs} from 'fs';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config({path: './conf/.env'});

import scrapItemInfoByID from '../scraper/scraper';
import {Scrape} from '../interfaces/Scrape';

beforeAll(async () => {
  const data = await fs.readFile(path.resolve(__dirname, './scraper.mockScrappedItem.txt'), 'utf8');
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
    const object: Scrape = {
      itemID: '6690',
      name: 'Blacksmith Blessing',
      type: 'Etc',
      equipLocation: '-',
      vend: [
        {
          shopID: '2123',
          shopName: 'BILIBELLS',
          price: 4400000,
          amount: 643,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '2085',
          shopName: 'bebi',
          price: 4550000,
          amount: 93,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '1918',
          shopName: 'BSB',
          price: 4700000,
          amount: 422,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '1421',
          shopName: 'BSB',
          price: 4750000,
          amount: 345,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '1809',
          shopName: 'Grind',
          price: 4750000,
          amount: 34,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '2091',
          shopName: 'Toko7',
          price: 4900000,
          amount: 7,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '2098',
          shopName: 'S>',
          price: 4900000,
          amount: 66,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '1604',
          shopName: '',
          price: 4948998,
          amount: 400,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '732',
          shopName: 'Store',
          price: 4949000,
          amount: 137,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '537',
          shopName: '13s',
          price: 4950000,
          amount: 468,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '654',
          shopName: 'vit/spell/int',
          price: 4990000,
          amount: 112,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '2016',
          shopName: 'Refiniwis',
          price: 5000000,
          amount: 384,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '667',
          shopName: '05xd',
          price: 5000000,
          amount: 10,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '469',
          shopName: '',
          price: 5399000,
          amount: 205,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '1576',
          shopName: 'OwO',
          price: 5500000,
          amount: 400,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '474',
          shopName: 'Your friends',
          price: 5500000,
          amount: 380,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '253',
          shopName: 'BSB',
          price: 5949998,
          amount: 8,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '236',
          shopName: 'Quat',
          price: 5969693,
          amount: 364,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '701',
          shopName: '11s',
          price: 6000000,
          amount: 517,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
        {
          shopID: '138',
          shopName: 'Bsbs, melee, Berze',
          price: 6400000,
          amount: 120,
          card0: '-',
          card1: '-',
          card2: '-',
          card3: '-',
        },
      ],
    };
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
