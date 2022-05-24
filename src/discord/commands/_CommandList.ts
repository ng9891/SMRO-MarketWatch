import {Command} from '../../ts/interfaces/Command';
import { ping } from './ping';
import {add} from './add'

const CommandList: Command[] = [
  ping,
  add
]

export default CommandList;
