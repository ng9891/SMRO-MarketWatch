import {
  parse,
  AssignmentStatement,
  TableConstructorExpression,
  TableKeyString,
  StringLiteral,
  TableKey,
  NumericLiteral,
} from 'luaparse';
import {promises as fs} from 'fs';
import path from 'path';

interface item {
  id: number;
  name: string;
}

export const parseLua = async () => {
  const data = await fs.readFile(path.resolve(__dirname, '../assets/iteminfo.lua'), 'utf8');
  const parsedLua = parse(data, {comments: false});

  const body = parsedLua.body[0] as AssignmentStatement;
  const init = body.init[0] as TableConstructorExpression;
  const fields = init.fields;

  const arr: Array<item> = [];
  for (const field of fields) {
    const item = field as TableKey;
    const itemKey = item.key as NumericLiteral;

    const key = itemKey.value;

    const tbl = item.value as TableConstructorExpression;
    const tblValues = tbl.fields.values();
    let itemName = '';
    for (const val of tblValues) {
      const keyField = val as TableKeyString;
      if (keyField.key.name === 'identifiedDisplayName') {
        const itemField = keyField.value as StringLiteral;
        itemName = itemField.raw.replace(/"/g, '');
      }
    }
    arr.push({id: key, name: itemName});
  }

  await fs.writeFile(path.resolve(__dirname, '../assets/iteminfo.json'), JSON.stringify(arr));
  console.log('Parsing lua with parser finished');
};

parseLua();
