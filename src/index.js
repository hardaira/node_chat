/* eslint-disable no-console */

'use strict';
import './setup.js';

import { createServer } from './createServer';

createServer().listen(5800, () => {
  console.log('Server is running on localhost:5800');
});
