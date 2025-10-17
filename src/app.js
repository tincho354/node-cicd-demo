import express from 'express';
import routes from './routes.js';

const app = express();

app.use(express.json());
app.use('/', routes);

// Env / config
const PORT = process.env.PORT || 3000;

// Start server only if not running under test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
