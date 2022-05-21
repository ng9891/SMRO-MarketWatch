export const cleanShopText = (text: string) => {
  return text
    .replace(/\( Enchant \)/, '')
    .replace(/\\n/, '')
    .replace(/\bNone\b/g, '-')
    .trim();
};

export const cleanShopPrice = (text: string) => {
  return Number(
    text
      .replace(/\( Enchant \)/, '')
      .replace(/\\n/, '')
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

export const parsePriceString = (price: string) => {
  const num = Number.parseFloat(price);
  if (price.endsWith('b')) return convertToBillions(num);
  if (price.endsWith('m')) return convertToMillions(num);
  if (price.endsWith('k')) return convertToThousands(num);
  return num;
};

export const displayInThousands = (num: number) => {
  return (num / 1000).toFixed(2) + 'k';
};

export const displayInMillions = (num: number) => {
  return (num / 1000000).toFixed(2) + 'm';
};

export const displayInBillions = (num: number) => {
  return (num / 1000000000).toFixed(2) + 'b';
};

export const formatPrice = (num: number) => {
  if (num < 1000000) return displayInThousands(num);
  if (num < 1000000000) return displayInMillions(num);
  return displayInBillions(num);
};