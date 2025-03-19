import React, { useEffect } from 'react';

interface GraduationYearsSectionProps {
  graduationYear: {
    min: string;
    max: string;
  };
  ageRange?: [number | '', number | '']; // 年齢範囲を受け取るように追加
  onGraduationYearChange: (year: { min: string; max: string }) => void;
}

// 年齢から卒業年を計算する関数（高校卒業をベースに）
const calculateGraduationYear = (age: number): number => {
  const currentYear = new Date().getFullYear();
  // 高校卒業時の年齢は18歳
  return currentYear - age + 18;
};

const GraduationYearSection: React.FC<GraduationYearsSectionProps> = ({
  graduationYear,
  ageRange,
  onGraduationYearChange
}) => {
  // 年齢範囲が変更されたときに卒業年を自動計算
  useEffect(() => {
    if (ageRange && ageRange[0] !== '' && ageRange[1] !== '') {
      const minAge = Number(ageRange[0]);
      const maxAge = Number(ageRange[1]);
      
      if (!isNaN(minAge) && !isNaN(maxAge)) {
        const minGradYear = calculateGraduationYear(maxAge); // 最高年齢から最小卒業年を計算
        const maxGradYear = calculateGraduationYear(minAge); // 最小年齢から最大卒業年を計算

        // 現在の値と異なる場合のみ更新
        if (graduationYear.min !== minGradYear.toString() || graduationYear.max !== maxGradYear.toString()) {
          onGraduationYearChange({
            min: minGradYear.toString(),
            max: maxGradYear.toString()
          });
        }
      }
    }
  }, [ageRange, graduationYear]); // onGraduationYearChangeを依存配列から削除

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        最終学歴卒業年
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          name="minimumFinalGraduationYear"
          placeholder="指定なし"
          value={graduationYear.min}
          onChange={(e) => onGraduationYearChange({
            ...graduationYear,
            min: e.target.value
          })}
          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <span className="text-sm text-gray-500">年以降 〜</span>
        <input
          type="text"
          name="maximumFinalGraduationYear"
          placeholder="指定なし"
          value={graduationYear.max}
          onChange={(e) => onGraduationYearChange({
            ...graduationYear,
            max: e.target.value
          })}
          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <span className="text-sm text-gray-500">年以前</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        ※ 年齢範囲から自動的に推定された高校卒業年です
      </p>
    </div>
  );
};

export default GraduationYearSection;