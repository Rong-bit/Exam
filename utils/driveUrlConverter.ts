/**
 * Google Drive URL 轉換工具
 * 將 Google Drive 的查看連結轉換為可直接使用的圖片連結
 */

/**
 * 從 Google Drive URL 中提取檔案 ID
 */
export function extractDriveFileId(url: string): string | null {
  // 匹配格式: https://drive.google.com/file/d/FILE_ID/view
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // 匹配格式: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) {
    return match2[1];
  }
  
  return null;
}

/**
 * 檢查是否為 Google Drive URL
 */
export function isGoogleDriveUrl(url: string): boolean {
  return /drive\.google\.com/.test(url);
}

/**
 * CORS 代理服務列表（按優先順序）
 */
const PROXY_SERVICES = [
  // 方案 1: images.weserv.nl (穩定，但可能有速率限制)
  (url: string) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
  // 方案 2: corsproxy.io (備選方案)
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // 方案 3: api.allorigins.win (備選方案)
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

/**
 * 將 Google Drive URL 轉換為可直接使用的圖片連結
 * @param url 原始 Google Drive URL
 * @param useProxy 是否使用 CORS 代理（推薦，因為 Google Drive 有 CORS 限制）
 */
export function convertDriveUrlToImage(url: string, useProxy: boolean = true): string {
  const fileId = extractDriveFileId(url);
  
  if (!fileId) {
    // 如果不是有效的 Google Drive URL，直接返回原 URL
    return url;
  }
  
  // 轉換為直接圖片連結
  const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  
  if (useProxy) {
    // 使用第一個 CORS 代理服務（優先順序最高）
    return PROXY_SERVICES[0](directUrl);
  }
  
  return directUrl;
}

/**
 * 為 Google Drive URL 生成多個備選連結（用於重試機制）
 * @param url 原始 Google Drive URL
 * @returns 備選 URL 陣列，按優先順序排列
 */
export function generateDriveImageAlternatives(url: string): string[] {
  const fileId = extractDriveFileId(url);
  
  if (!fileId) {
    // 如果不是有效的 Google Drive URL，返回原 URL
    return [url];
  }
  
  const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920-h1080`;
  
  // 生成備選 URL 列表（按優先順序）
  const alternatives: string[] = [
    // 1. 使用第一個代理服務的直接連結
    PROXY_SERVICES[0](directUrl),
    // 2. 使用第二個代理服務的直接連結
    PROXY_SERVICES[1](directUrl),
    // 3. 使用第三個代理服務的直接連結
    PROXY_SERVICES[2](directUrl),
    // 4. 使用第一個代理服務的縮圖連結（可能更穩定）
    PROXY_SERVICES[0](thumbnailUrl),
    // 5. 直接連結（最後嘗試，可能因 CORS 失敗）
    directUrl,
  ];
  
  return alternatives;
}

/**
 * 轉換為 Google Drive 縮圖連結（較小尺寸，但可能更穩定）
 */
export function convertDriveUrlToThumbnail(url: string, size: string = 'w1920-h1080'): string {
  const fileId = extractDriveFileId(url);
  
  if (!fileId) {
    return url;
  }
  
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
}

