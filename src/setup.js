//const { Expense } = require('./models/Expense.model');
import { Message } from './models/messageModel';
import { Room } from './models/roomModel';

//Expense.sync({ force: false });
Message.sync({ force: false });
Room.sync({ force: false });
