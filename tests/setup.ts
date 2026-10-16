import * as dotenv from 'dotenv'
import { DateTime, Settings } from 'luxon'

// load .env.test
dotenv.config({ path: __dirname + '/../.env.test' })

// set DateTime.now()
const expectedNow = DateTime.local(2010, 10, 10, 10, 10, 10, 10).toMillis()
Settings.now = () => expectedNow