import { Router } from 'express';
import properties from '../data/properties.json' with { type: 'json' };
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const propertiesRouter = Router();

propertiesRouter.get('/', (_req, res) => {
  res.json(properties);
});

propertiesRouter.get('/overlays/:type', (req, res) => {
  const { type } = req.params;
  const validTypes = ['crime', 'schools', 'population', 'noise'];

  if (!validTypes.includes(type)) {
    res.status(400).json({ error: `Invalid overlay type. Must be one of: ${validTypes.join(', ')}` });
    return;
  }

  try {
    const filePath = join(__dirname, '..', 'data', 'overlays', `${type}.geojson`);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    res.json(data);
  } catch {
    res.status(404).json({ error: `Overlay data for '${type}' not found` });
  }
});
