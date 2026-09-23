import path from 'path';
import fs from 'fs';
import * as xlsxModule from 'xlsx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const XLSX: any = (xlsxModule as any).default || xlsxModule;

export interface PlacementDrive {
  id: string;
  company: string;
  role: string;
  tier: string;
  dateListed?: string;
  ctc: string;
  stipend?: string;
  eligibleBranches: string[];
  deadline: string;
  cgpaCutoff?: string;
  oaDate?: string;
  interviewDate?: string;
  supersetLink: string;
}

const dataDir = path.resolve(process.cwd(), 'data');
export const EXCEL_PATH = path.join(dataDir, 'placements.xlsx');
export const CSV_PATH = path.join(dataDir, 'placements.csv');

function parseBranches(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (!raw) return ['Refer Superset'];
  const str = String(raw).trim();
  if (!str) return ['Refer Superset'];
  return str
    .split(',')
    .map((s) => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

function normalizeTier(rawTier: unknown): string {
  if (!rawTier) return 'Regular';
  const str = String(rawTier).trim();
  if (/^\d+$/.test(str)) {
    return `Tier ${str}`;
  }
  return str;
}

function normalizeDate(rawDate: unknown): string {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (!str) return '';

  // If numeric Excel serial
  if (/^\d+(\.\d+)?$/.test(str)) {
    const serial = parseFloat(str);
    if (serial > 30000 && serial < 60000) {
      const utc_days = Math.floor(serial - 25569);
      const date = new Date(utc_days * 86400 * 1000);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }

  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }

  return str;
}

function normalizeCtc(rawCtc: unknown): string {
  if (!rawCtc) return 'Check Superset';
  const str = String(rawCtc).trim();
  if (!str) return 'Check Superset';
  // If it's just a number like 9.43 or $9.43, add LPA if not present
  if (/^[$₹]?\s*\d+(\.\d+)?$/.test(str)) {
    return `${str} LPA`;
  }
  return str;
}

/**
 * Dynamically gets GOOGLE_SHEET_URL from process.env or .env file directly
 */
export function getGoogleSheetUrl(): string {
  if (process.env.GOOGLE_SHEET_URL && process.env.GOOGLE_SHEET_URL.trim()) {
    return process.env.GOOGLE_SHEET_URL.trim();
  }
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/GOOGLE_SHEET_URL\s*=\s*([^\r\n]+)/);
      if (match) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    } catch {
      // ignore
    }
  }
  return '';
}

/**
 * Converts any Google Sheet URL (edit, share, pubhtml) to direct CSV export URL
 */
export function getGoogleSheetCsvUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (trimmed.includes('/export?format=csv') || trimmed.includes('/pub?output=csv')) {
    return trimmed;
  }
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    const docId = match[1];
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
  }
  return trimmed;
}

/**
 * Maps raw JSON/CSV rows into standard PlacementDrive objects
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRawRowsToDrives(rows: any[]): PlacementDrive[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows
    .map((row: any, idx: number) => {
      const company = String(row.Company || row.company || '').trim();
      const role = String(row.Role || row.role || 'Job Profile').trim();
      const tier = normalizeTier(row.Tier || row.tier);
      const dateListed = normalizeDate(
        row['Date Listed'] || row.dateListed || row['Listed Date']
      );
      const ctc = normalizeCtc(row.CTC || row.ctc);
      const stipend = row.Stipend || row.stipend ? String(row.Stipend || row.stipend).trim() : undefined;
      const eligibleBranches = parseBranches(
        row['Eligible Branches'] || row.eligibleBranches || row.Branches || row.branches
      );
      const deadline = normalizeDate(row.Deadline || row.deadline) || 'Check Superset';
      const cgpaCutoff = row['CGPA cutoff'] || row.cgpaCutoff || row.CGPA ? String(row['CGPA cutoff'] || row.cgpaCutoff || row.CGPA).trim() : undefined;
      const oaDate = normalizeDate(row['Online Assessment Date'] || row.oaDate || row.OA);
      const interviewDate = normalizeDate(row['Interview Date'] || row.interviewDate || row.Interview);

      const supersetLink = String(
        row['Superset Link'] || row.supersetLink || row.Link || 'https://app.joinsuperset.com'
      ).trim();

      const id = `pl_${company.toLowerCase().replace(/[^a-z0-9]/g, '')}_${idx + 1}`;

      return {
        id,
        company,
        role,
        tier,
        dateListed,
        ctc,
        stipend,
        eligibleBranches,
        deadline,
        cgpaCutoff,
        oaDate: oaDate || undefined,
        interviewDate: interviewDate || undefined,
        supersetLink,
      };
    })
    .filter((d) => Boolean(d.company));
}

/**
 * Loads all placement rows from Google Sheet if URL configured, else local spreadsheet
 */
export async function getAllPlacements(): Promise<{ drives: PlacementDrive[]; source: string }> {
  const googleSheetUrl = getGoogleSheetUrl();

  // 1. Try Live Google Sheet if URL exists
  if (googleSheetUrl && googleSheetUrl.trim()) {
    try {
      const csvExportUrl = getGoogleSheetCsvUrl(googleSheetUrl);
      const res = await fetch(csvExportUrl, {
        cache: 'no-store',
        headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
      });

      if (res.ok) {
        const csvText = await res.text();
        // Use raw: true so dates are NOT converted to serial numbers
        const workbook = XLSX.read(csvText, { type: 'string', raw: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: true }) || [];
        const drives = mapRawRowsToDrives(rows);
        return { drives, source: 'Google Sheets (Live)' };
      } else {
        console.warn(`[Google Sheets] Failed to fetch CSV: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error('[Google Sheets] Error fetching live sheet:', err);
    }
  }

  // 2. Fallback to Local Excel/CSV
  let targetFile = EXCEL_PATH;
  if (fs.existsSync(CSV_PATH) && fs.existsSync(EXCEL_PATH)) {
    const csvMtime = fs.statSync(CSV_PATH).mtimeMs;
    const xlsxMtime = fs.statSync(EXCEL_PATH).mtimeMs;
    if (csvMtime > xlsxMtime) {
      targetFile = CSV_PATH;
    }
  } else if (!fs.existsSync(EXCEL_PATH) && fs.existsSync(CSV_PATH)) {
    targetFile = CSV_PATH;
  }

  if (!fs.existsSync(targetFile)) {
    return { drives: [], source: 'Empty' };
  }

  try {
    const fileBuffer = fs.readFileSync(targetFile);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', raw: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: true }) || [];
    const drives = mapRawRowsToDrives(rows);
    return { drives, source: 'Local Spreadsheet' };
  } catch (error) {
    console.error('Error reading local placements spreadsheet:', error);
    return { drives: [], source: 'Error' };
  }
}
