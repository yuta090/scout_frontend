import { JobCategory } from '../types';

export const ACADEMIC_CATEGORIES: JobCategory = {
  id: 'academic',
  name: '学術研究',
  subcategories: [
    {
      id: 'humanities_social',
      name: '総合人文社会',
      jobs: [
        { id: 'humanities_social', name: '総合人文社会', value: 'be3a0' }
      ]
    },
    {
      id: 'humanities',
      name: '人文学',
      jobs: [
        { id: 'humanities', name: '人文学', value: 'f8fc6' }
      ]
    },
    {
      id: 'social_science',
      name: '社会科学',
      jobs: [
        { id: 'social_science', name: '社会科学', value: '10efe' }
      ]
    },
    {
      id: 'science_engineering',
      name: '総合理工',
      jobs: [
        { id: 'science_engineering', name: '総合理工', value: '7f8a0' }
      ]
    },
    {
      id: 'mathematical_physics',
      name: '数物系科学',
      jobs: [
        { id: 'mathematical_physics', name: '数物系科学', value: '42dee' }
      ]
    },
    {
      id: 'chemistry',
      name: '化学',
      jobs: [
        { id: 'chemistry', name: '化学', value: '8bed8' }
      ]
    },
    {
      id: 'engineering',
      name: '工学',
      jobs: [
        { id: 'engineering', name: '工学', value: '15622' }
      ]
    },
    {
      id: 'biology',
      name: '総合生物',
      jobs: [
        { id: 'biology', name: '総合生物', value: '4c4df' }
      ]
    },
    {
      id: 'biological_science',
      name: '生物学',
      jobs: [
        { id: 'biological_science', name: '生物学', value: 'a6f8c' }
      ]
    },
    {
      id: 'agriculture',
      name: '農学',
      jobs: [
        { id: 'agriculture', name: '農学', value: 'efb7d' }
      ]
    },
    {
      id: 'medicine',
      name: '医歯薬学',
      jobs: [
        { id: 'medicine', name: '医歯薬学', value: '908ef' }
      ]
    },
    {
      id: 'informatics',
      name: '情報学',
      jobs: [
        { id: 'informatics', name: '情報学', value: '4d37e' }
      ]
    },
    {
      id: 'environmental',
      name: '環境学',
      jobs: [
        { id: 'environmental', name: '環境学', value: '7f63c' }
      ]
    },
    {
      id: 'interdisciplinary',
      name: '複合領域',
      jobs: [
        { id: 'interdisciplinary', name: '複合領域', value: '43a56' }
      ]
    },
    {
      id: 'academic_other',
      name: 'その他',
      jobs: [
        { id: 'academic_other', name: 'その他', value: 'b4fcc' }
      ]
    }
  ]
};