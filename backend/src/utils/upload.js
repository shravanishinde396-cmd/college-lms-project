import multer from 'multer';
import fs from 'fs';
import path from 'path';

const dir = 'uploads';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

export default multer({ storage });
