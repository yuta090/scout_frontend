import React, { useState, useRef } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Customer } from '../lib/supabase';

interface ExcelUploadProps {
  onUpload: (customers: Omit<Customer, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
}

const REQUIRED_COLUMNS = ['company_name', 'contact_name', 'email', 'phone'];
const COLUMN_LABELS = {
  company_name: '会社名',
  contact_name: '担当者名',
  email: 'メールアドレス',
  phone: '電話番号',
  airwork_username: 'Airワークユーザー名',
  airwork_password: 'Airワークパスワード'
};

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onUpload, onClose, isOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      Object.values(COLUMN_LABELS),
      ['株式会社サンプル', '山田太郎', 'yamada@example.com', '03-1234-5678', 'username', 'password']
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, '顧客情報テンプレート.xlsx');
  };

  const validateData = (data: any[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      // 必須項目のチェック
      REQUIRED_COLUMNS.forEach(column => {
        if (!row[column] || row[column].toString().trim() === '') {
          errors.push({
            row: index + 2, // Excelの行番号は1から始まり、ヘッダーが1行目
            column: COLUMN_LABELS[column as keyof typeof COLUMN_LABELS],
            message: '必須項目です'
          });
        }
      });

      // メールアドレスの形式チェック
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push({
          row: index + 2,
          column: COLUMN_LABELS.email,
          message: 'メールアドレスの形式が正しくありません'
        });
      }

      // 電話番号の形式チェック
      if (row.phone && !/^[0-9-]+$/.test(row.phone)) {
        errors.push({
          row: index + 2,
          column: COLUMN_LABELS.phone,
          message: '電話番号は数字とハイフンのみ使用可能です'
        });
      }
    });

    return errors;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrors([]);
    setSuccessMessage(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // データの検証
      const validationErrors = validateData(jsonData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      // データの整形
      const customers = jsonData.map(row => ({
        company_name: row.company_name,
        contact_name: row.contact_name,
        email: row.email,
        phone: row.phone,
        airwork_login: {
          username: row.airwork_username,
          password: row.airwork_password
        },
        status: 'active' as const
      }));

      await onUpload(customers);
      setSuccessMessage(`${customers.length}件の顧客情報を登録しました`);
      
      // ファイル選択をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('File upload error:', err);
      setErrors([{
        row: 0,
        column: '',
        message: 'ファイルの処理中にエラーが発生しました'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            顧客情報の一括登録
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              手順:
            </h3>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. テンプレートをダウンロードして必要な情報を入力</li>
              <li>2. 入力済みのExcelファイルをアップロード</li>
              <li>3. データの検証が行われ、問題がなければ一括登録されます</li>
            </ol>
          </div>

          <div className="flex justify-center">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-5 w-5 mr-2" />
              テンプレートをダウンロード
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>ファイルを選択</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    ref={fileInputRef}
                    className="sr-only"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                </label>
                <p className="pl-1">またはドラッグ＆ドロップ</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">
                Excel形式のファイル (.xlsx, .xls)
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">処理中...</p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    以下のエラーを修正してください:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>
                          {error.row > 0 ? `${error.row}行目 - ${error.column}: ` : ''}
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload;