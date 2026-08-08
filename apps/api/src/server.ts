import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

const app = createApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Isekai RPG API Server running on http://0.0.0.0:${PORT}`);
  console.log(`AI Provider: ${process.env.GEMINI_API_KEY ? 'Gemini (configured)' : 'Fallback only (no API key)'}`);
});
