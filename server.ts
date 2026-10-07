/**
 * Bitvera Sales — Standalone Enterprise Production Server
 * 
 * Serves compiled production frontend assets while hosting the authoritative
 * server-side ERPNext proxy gateway securely.
 */

import express from 'express';
import path from 'path';
import { handleErpApiRequest } from './src/server/erpBackend';

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

// Mount server-side ERPNext integration gateway
app.use('/api/erp', (req, res) => {
  handleErpApiRequest(req, res);
});

// Serve static frontend assets
app.use(express.static(DIST_DIR));

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Bitvera Sales] Server listening on http://0.0.0.0:${PORT}`);
  console.log(`[Bitvera Sales] ERPNext Gateway active at http://0.0.0.0:${PORT}/api/erp`);
});
