import { ExamSession, BoardConfig } from '../types';

const CLASSES_KEY = 'exam_classes';
const DATA_PREFIX = 'exam_data_';

export interface ClassData {
  config: BoardConfig;
  sessions: ExamSession[];
}

// 獲取所有班級列表
export const getAllClasses = (): string[] => {
  try {
    const classesJson = localStorage.getItem(CLASSES_KEY);
    if (!classesJson) return [];
    return JSON.parse(classesJson);
  } catch (error) {
    console.error('讀取班級列表失敗:', error);
    return [];
  }
};

// 保存班級列表
const saveClassesList = (classes: string[]): void => {
  try {
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
  } catch (error) {
    console.error('保存班級列表失敗:', error);
  }
};

// 加載指定班級的數據
export const loadClassData = (className: string): ClassData | null => {
  try {
    const dataKey = `${DATA_PREFIX}${className}`;
    const dataJson = localStorage.getItem(dataKey);
    if (!dataJson) return null;
    return JSON.parse(dataJson);
  } catch (error) {
    console.error(`讀取班級 ${className} 數據失敗:`, error);
    return null;
  }
};

// 保存指定班級的數據
export const saveClassData = (className: string, data: ClassData): void => {
  try {
    const dataKey = `${DATA_PREFIX}${className}`;
    localStorage.setItem(dataKey, JSON.stringify(data));
    // 確保班級在列表中
    const classes = getAllClasses();
    if (!classes.includes(className)) {
      classes.push(className);
      saveClassesList(classes);
    }
  } catch (error) {
    console.error(`保存班級 ${className} 數據失敗:`, error);
  }
};

// 添加新班級
export const addClass = (className: string): boolean => {
  try {
    const classes = getAllClasses();
    if (classes.includes(className)) {
      return false; // 班級已存在
    }
    classes.push(className);
    saveClassesList(classes);
    return true;
  } catch (error) {
    console.error('添加班級失敗:', error);
    return false;
  }
};

// 刪除班級
export const deleteClass = (className: string): boolean => {
  try {
    const classes = getAllClasses();
    const index = classes.indexOf(className);
    if (index === -1) {
      return false; // 班級不存在
    }
    classes.splice(index, 1);
    saveClassesList(classes);
    // 刪除班級的數據
    const dataKey = `${DATA_PREFIX}${className}`;
    localStorage.removeItem(dataKey);
    return true;
  } catch (error) {
    console.error('刪除班級失敗:', error);
    return false;
  }
};

// 導出班級數據（用於備份）
export const exportClassData = (className: string): string | null => {
  const data = loadClassData(className);
  if (!data) return null;
  return JSON.stringify(data, null, 2);
};

// 導入班級數據（用於恢復）
export const importClassData = (className: string, jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData) as ClassData;
    saveClassData(className, data);
    return true;
  } catch (error) {
    console.error('導入班級數據失敗:', error);
    return false;
  }
};

// 獲取或創建默認班級數據
export const getDefaultClassData = (): ClassData => {
  return {
    config: {
      title: '113學年度 第一學期 期末考試',
      date: new Date().toISOString().split('T')[0],
      venue: '教學大樓 總體考場',
      backgroundImageUrl: '',
      targetClass: '',
      showAttendance: true,
      examRules: [
        '請攜帶准考證或國民身分證。',
        '手機及電子設備請關機。',
        '考試開始 20 分鐘後不得入場。'
      ]
    },
    sessions: []
  };
};

