import app from './app.mjs';
import config from './config/config.mjs';

const PORT = config.port || 3000;

app.listen(PORT, () => {
    console.log('Server is running on port: ' + PORT)
});
