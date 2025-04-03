import { JobCategory } from '../types';

export const CORPORATE_CATEGORIES: JobCategory = {
  id: 'corporate',
  name: 'コーポレートスタッフ',
  subcategories: [
    {
      id: 'accounting',
      name: '経理/税務/財務',
      jobs: [
        { id: 'management_accounting', name: '管理会計', value: '492ba' },
        { id: 'financial_accounting', name: '財務会計', value: '1fffe' },
        { id: 'tax', name: '税務', value: 'a4683' },
        { id: 'finance', name: '財務/ファイナンス', value: 'bd4d4' }
      ]
    },
    {
      id: 'hr',
      name: '人事',
      jobs: [
        { id: 'hr_planning', name: '人事企画/制度設計', value: '3a8d1' },
        { id: 'recruitment', name: '採用', value: '31fb4' },
        { id: 'training', name: '社員教育/研修', value: 'cb6ae' },
        { id: 'evaluation', name: '人事評価', value: '53ac2' },
        { id: 'organization', name: '組織開発/リテンション', value: 'dbcd3' },
        { id: 'es', name: '従業員満足度/ES', value: '450e35' },
        { id: 'labor', name: '福利厚生/労務/給与管理', value: 'e0642' },
        { id: 'hr_other', name: 'その他', value: '610e13' }
      ]
    },
    {
      id: 'general_affairs',
      name: '総務',
      jobs: [
        { id: 'general_affairs', name: '総務', value: 'd423c' }
      ]
    },
    {
      id: 'legal',
      name: '法務/知財',
      jobs: [
        { id: 'legal', name: '法務', value: 'b82bb' },
        { id: 'ip', name: '知的財産', value: 'f5606' },
        { id: 'patent', name: '特許', value: '4a30e' },
        { id: 'compliance', name: 'コンプライアンス', value: '8cb90' },
        { id: 'legal_other', name: 'その他', value: '32f0d' }
      ]
    },
    {
      id: 'it_system',
      name: '情報システム',
      jobs: [
        { id: 'it_system', name: '情報システム', value: '2b9b0' },
        { id: 'security', name: '情報セキュリティ', value: '9fded' },
        { id: 'financial_system', name: '金融システム', value: 'e165a' },
        { id: 'it_system_other', name: 'その他', value: '3627e' }
      ]
    },
    {
      id: 'pr_ir',
      name: '広報/IR',
      jobs: [
        { id: 'pr', name: '広報/PR', value: 'cb0b0' },
        { id: 'csr', name: 'CSR', value: '0d752' },
        { id: 'ir', name: 'IR', value: '3cfde' },
        { id: 'internal_pr', name: '社内広報', value: '1305f' },
        { id: 'pr_ir_other', name: 'その他', value: '9adc1' }
      ]
    },
    {
      id: 'internal_audit',
      name: '内部監査/内部統制',
      jobs: [
        { id: 'internal_audit', name: '内部監査', value: 'd5812' },
        { id: 'internal_control', name: '内部統制', value: '2d1e2' }
      ]
    },
    {
      id: 'risk_management',
      name: 'リスク管理',
      jobs: [
        { id: 'risk_management', name: 'リスク管理', value: '5e1b9' }
      ]
    },
    {
      id: 'external_affairs',
      name: '渉外',
      jobs: [
        { id: 'external_affairs', name: '渉外', value: '99977' }
      ]
    },
    {
      id: 'corporate_other',
      name: 'その他',
      jobs: [
        { id: 'corporate_other', name: 'その他', value: '30b21' }
      ]
    }
  ]
};