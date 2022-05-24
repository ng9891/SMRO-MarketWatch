export const cleanShopText = (text: string) => {
  return text
    .split(/\n|\\n/)
    .reduce((prev, el) => {
      if (!el) return prev;
      if (el === '( Enchant )') return prev;
      if (el === 'None') return (prev += '-');
      return (prev += ' ' + el.trim());
    }, '')
    .trim();
};

export const cleanShopPrice = (text: string) => {
  return Number(
    text
      .replace(/\( Enchant \)/, '')
      .replace(/\\n/g, '')
      .replace(/,/g, '')
      .slice(0, -2)
      .trim()
  );
};

export const convertToThousands = (num: number) => {
  return num * 1000;
};

export const convertToMillions = (num: number) => {
  return num * 1000000;
};

export const convertToBillions = (num: number) => {
  return num * 1000000000;
};

export const checkValidPriceString = (price: string) => {
  const regex = /^\d+(\.?\d*)?[k|m|b]?$/g;
  const found = price.match(regex);
  return found ? found[0] : null;
};

export const parsePriceString = (price: string) => {
  const valid = checkValidPriceString(price);
  if (!valid) return null;
  const num = Number.parseFloat(valid);
  if (isNaN(num)) return null;
  if (price.endsWith('b')) return convertToBillions(num);
  if (price.endsWith('m')) return convertToMillions(num);
  if (price.endsWith('k')) return convertToThousands(num);
  return num;
};

export const displayInThousands = (num: number) => {
  return parseFloat((num / 1000).toFixed(2)) + 'k';
};

export const displayInMillions = (num: number) => {
  return parseFloat((num / 1000000).toFixed(2)) + 'm';
};

export const displayInBillions = (num: number) => {
  return parseFloat((num / 1000000000).toFixed(2)) + 'b';
};

export const formatPrice = (num: number) => {
  if (num <= 0) return '0';
  if (num < 1000000) return displayInThousands(num);
  if (num < 1000000000) return displayInMillions(num);
  return displayInBillions(num);
};