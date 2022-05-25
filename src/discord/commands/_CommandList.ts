import {Command} from '../../ts/interfaces/Command';
import {help} from './help.command';
import {watchlist} from './watchlist.command';

const CommandList: Command[] = [help, watchlist];

export default CommandList;
