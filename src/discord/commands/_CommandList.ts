import {Command} from '../../ts/interfaces/Command';
import {ping} from './ping';
import {add} from './add';
import {list} from './list';

const CommandList: Command[] = [ping, add, list];

export default CommandList;
