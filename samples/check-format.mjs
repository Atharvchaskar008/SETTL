import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dealsDir = path.join(__dirname, 'deals');

if (!fs.existsSync(dealsDir)) {
  console.error(`Deals directory not found: ${dealsDir}`);
  process.exit(1);
}

const files = fs.readdirSync(dealsDir);
const txtFiles = files.filter(f => f.endsWith('.txt')).sort();

if (txtFiles.length === 0) {
  console.error('No .txt deal files found in samples/deals/');
  process.exit(1);
}

let anyFailed = false;

function isWholeNumber(val) {
  return typeof val === 'number' && Number.isInteger(val) && val >= 0;
}

for (const txtFile of txtFiles) {
  const baseName = txtFile.slice(0, -4);
  const jsonFile = `${baseName}.expected.json`;
  const txtPath = path.join(dealsDir, txtFile);
  const jsonPath = path.join(dealsDir, jsonFile);

  const errors = [];

  if (!fs.existsSync(jsonPath)) {
    console.log(`FAIL ${baseName}: missing matching ${jsonFile}`);
    anyFailed = true;
    continue;
  }

  const txtContent = fs.readFileSync(txtPath, 'utf8');

  let data;
  try {
    const rawJson = fs.readFileSync(jsonPath, 'utf8');
    data = JSON.parse(rawJson);
  } catch (err) {
    console.log(`FAIL ${baseName}: invalid JSON (${err.message})`);
    anyFailed = true;
    continue;
  }

  // Check top-level keys
  const requiredTopKeys = ['title', 'payers', 'judge', 'stages', 'unclear', 'total'];
  for (const key of requiredTopKeys) {
    if (!(key in data)) {
      errors.push(`missing required key '${key}'`);
    }
  }

  if (typeof data.title !== 'string') {
    errors.push("'title' must be a string");
  }

  if (!Array.isArray(data.payers)) {
    errors.push("'payers' must be an array");
  } else {
    for (let i = 0; i < data.payers.length; i++) {
      const p = data.payers[i];
      if (typeof p !== 'object' || p === null) {
        errors.push(`payers[${i}] must be an object`);
        continue;
      }
      if (typeof p.name !== 'string') errors.push(`payers[${i}].name must be a string`);
      if (!isWholeNumber(p.share)) errors.push(`payers[${i}].share must be a non-negative whole number`);
    }
  }

  if (typeof data.judge !== 'object' || data.judge === null || typeof data.judge.name !== 'string') {
    errors.push("'judge' must be an object with string 'name'");
  }

  if (!Array.isArray(data.stages)) {
    errors.push("'stages' must be an array");
  } else {
    for (let i = 0; i < data.stages.length; i++) {
      const s = data.stages[i];
      if (typeof s !== 'object' || s === null) {
        errors.push(`stages[${i}] must be an object`);
        continue;
      }
      if (typeof s.title !== 'string') errors.push(`stages[${i}].title must be a string`);
      if (typeof s.payee !== 'string') errors.push(`stages[${i}].payee must be a string`);
      if (!isWholeNumber(s.amount)) errors.push(`stages[${i}].amount must be a non-negative whole number`);
      if (typeof s.condition !== 'string') errors.push(`stages[${i}].condition must be a string`);
      if (typeof s.source !== 'string') {
        errors.push(`stages[${i}].source must be a string`);
      } else if (s.source.length > 0 && !txtContent.includes(s.source)) {
        errors.push(`stages[${i}].source not found in .txt`);
      }
    }
  }

  if (!Array.isArray(data.unclear)) {
    errors.push("'unclear' must be an array");
  } else {
    for (let i = 0; i < data.unclear.length; i++) {
      const u = data.unclear[i];
      if (typeof u !== 'object' || u === null) {
        errors.push(`unclear[${i}] must be an object`);
        continue;
      }
      if (typeof u.issue !== 'string') errors.push(`unclear[${i}].issue must be a string`);
      if (typeof u.question !== 'string') errors.push(`unclear[${i}].question must be a string`);
      if (typeof u.source !== 'string') {
        errors.push(`unclear[${i}].source must be a string`);
      } else if (u.source.length > 0 && !txtContent.includes(u.source)) {
        errors.push(`unclear[${i}].source not found in .txt`);
      }
    }
  }

  if (!isWholeNumber(data.total)) {
    errors.push("'total' must be a non-negative whole number");
  }

  // When unclear is empty, verify shares, stage amounts, and total agree
  if (Array.isArray(data.unclear) && data.unclear.length === 0) {
    const payerSum = Array.isArray(data.payers)
      ? data.payers.reduce((acc, p) => acc + (typeof p.share === 'number' ? p.share : 0), 0)
      : 0;
    const stageSum = Array.isArray(data.stages)
      ? data.stages.reduce((acc, s) => acc + (typeof s.amount === 'number' ? s.amount : 0), 0)
      : 0;

    if (payerSum !== data.total) {
      errors.push(`clean deal payer shares sum (${payerSum}) does not equal total (${data.total})`);
    }
    if (stageSum !== data.total) {
      errors.push(`clean deal stage amounts sum (${stageSum}) does not equal total (${data.total})`);
    }
  }

  if (errors.length > 0) {
    console.log(`FAIL ${baseName}: ${errors.join('; ')}`);
    anyFailed = true;
  } else {
    console.log(`PASS ${baseName}`);
  }
}

if (anyFailed) {
  process.exit(1);
}
