/* eslint-disable no-console */

'use strict';
import './setup.js';

import { createServer } from './createServer.js';

createServer().listen(5000, () => {
  console.log('Server is running on localhost:5000');
});
