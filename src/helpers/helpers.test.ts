import * as helpers from './helpers';

describe('Clean vend text', () => {
  test('Empty card slots', () => {
    const text = helpers.cleanShopText('\nNone\n');
    expect(text).toBe('-');
  });

  test('Empty card slots with double \\n', () => {
    const text = helpers.cleanShopText('\\nNone\\n');
    expect(text).toBe('-');
  });

  test('Empty string', () => {
    const text = helpers.cleanShopText('');
    expect(text).toBe('');
  });

  test('With module', () => {
    expect(helpers.cleanShopText('Automatic (Fixed Casting)\n')).toBe('Automatic (Fixed Casting)');
  });

  test('With card', () => {
    expect(helpers.cleanShopText('\nPoring Card\n')).toBe('Poring Card');
  });

  test('Double line break', () => {
    expect(helpers.cleanShopText('\n\n+12 Automatic Leg A-type\n')).toBe('+12 Automatic Leg A-type');
  });

  test('Random \\n', () => {
    expect(helpers.cleanShopText('\n\n+12 Automatic\n\nLeg A-type\n')).toBe('+12 Automatic Leg A-type');
  });

  test('Refinement', () => {
    expect(helpers.cleanShopText('\n\n+12')).toBe('+12');
  });

  test('Only \\n', () => {
    expect(helpers.cleanShopText('\n\n')).toBe('');
  });

  test('With options', () => {
    expect(
      helpers.cleanShopText(
        "\\n\\nCursed Knight's Shield\n[1] [2 Options]\nIncreases resistance against Demihuman monster by 4%Increases resistance against Demihuman monster by 5% "
      )
    ).toBe(
      "Cursed Knight's Shield [1] [2 Options] Increases resistance against Demihuman monster by 4%Increases resistance against Demihuman monster by 5%"
    );
  });

  test('With refinement and options', () => {
    expect(
      helpers.cleanShopText(
        "\\n\\n+9 Cursed Knight's Shield\n[ Options ]\\nIncreases physical damage inflicted on Demon monster by 1%Increases physical damage inflicted on Brute monster by 3% "
      )
    ).toBe(
      "+9 Cursed Knight's Shield [ Options ] Increases physical damage inflicted on Demon monster by 1%Increases physical damage inflicted on Brute monster by 3%"
    );
  });
});

describe('Clean vend prices', () => {
  test('Empty price', () => {
    expect(helpers.cleanShopPrice('')).toBe(0);
  });

  test('Not a number', () => {
    expect(helpers.cleanShopPrice('\nNone\n')).toBeNaN();
  });

  test('Millions', () => {
    expect(helpers.cleanShopPrice('250,000,000 z')).toBe(250000000);
  });

  test('With linebreak', () => {
    expect(helpers.cleanShopPrice('\n250\\n,000,000\n z\\n')).toBe(250000000);
  });
});

describe('Parse string to numbers', () => {
  test('thousands', () => {
    expect(helpers.parsePriceString('1.5k')).toBe(1500);
  });

  test('Double decimals', () => {
    expect(helpers.parsePriceString('2.55k')).toBe(2550);
  });

  test('millions', () => {
    expect(helpers.parsePriceString('2.5m')).toBe(2500000);
  });

  test('billions', () => {
    expect(helpers.parsePriceString('5.55b')).toBe(5550000000);
  });

  test('Invalid string', () => {
    expect(helpers.parsePriceString('6q')).toBeNull();
  });

  test('Invalid string 2', () => {
    expect(helpers.parsePriceString('m5')).toBeNull();
  });

  test('Negative', () => {
    expect(helpers.parsePriceString('-5')).toBeNull();
  });
});

describe('Parse number to string', () => {
  test('thousands', () => {
    expect(helpers.formatPrice(25000)).toBe('25k');
  });

  test('millions', () => {
    expect(helpers.formatPrice(25000000)).toBe('25m');
  });

  test('billions', () => {
    expect(helpers.formatPrice(5550000000)).toBe('5.55b');
  });

  test('0', () => {
    expect(helpers.formatPrice(0)).toBe('0');
  });

  test('Negative number', () => {
    expect(helpers.formatPrice(-12)).toBe('0');
  });

  test('With decimals', () => {
    expect(helpers.formatPrice(1500.55)).toBe('1.5k');
  });
});

import getUnixTime from 'date-fns/getUnixTime';
describe('Calculate Next Execution ', () => {
  test('Same date 10min recurrence', () => {
    const now = new Date(2022, 1, 1, 1, 40, 0);
    const next = new Date(2022, 1, 1, 1, 50, 0);
    expect(helpers.calculateNextExec(now, now, 10)).toEqual(next);
  });

  test('1 Year difference', () => {
    const recurrence = 30;
    const now = new Date(2022, 1, 1, 1, 40, 0);
    const before = new Date(2021, 1, 1, 1, 0, 0);
    const next = new Date(2022, 1, 1, 2, 0, 0);
    expect(helpers.calculateNextExec(before, now, recurrence)).toEqual(next);
  });

  test('10 days and 4 hrs 10min difference', () => {
    const recurrence = 20;
    const now = new Date(2022, 1, 10, 1, 40, 0);
    const before = new Date(2022, 1, 1, 4, 20, 0);
    const next = new Date(2022, 1, 10, 2, 0, 0);
    expect(helpers.calculateNextExec(before, now, recurrence)).toEqual(next);
  });

  test('with timestamp', () => {
    const recurrence = 20;
    const now = new Date(2022, 1, 10, 1, 40, 0);
    const before = new Date(2022, 1, 1, 4, 20, 0);
    const next = new Date(2022, 1, 10, 2, 0, 0);
    expect(helpers.calculateNextExec(getUnixTime(before), getUnixTime(now), recurrence)).toEqual(next);
  });

  test('In the future', () => {
    const now = new Date(2022, 1, 10, 1, 40, 0);
    const next = new Date(2022, 1, 10, 2, 0, 0);
    expect(helpers.calculateNextExec(next, now, 30)).toEqual(next);
  });
});
