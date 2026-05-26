import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readJSON(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

export function writeJSON(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

export function appendToJSON(filename, item) {
  try {
    const data = readJSON(filename);
    data.push(item);
    return writeJSON(filename, data);
  } catch (error) {
    console.error(`Error appending to ${filename}:`, error);
    return false;
  }
}

export function updateInJSON(filename, id, updates) {
  try {
    const data = readJSON(filename);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      return writeJSON(filename, data);
    }
    return false;
  } catch (error) {
    console.error(`Error updating in ${filename}:`, error);
    return false;
  }
}