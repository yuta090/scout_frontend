// 前のコードは同じ...

const handleJobTitleChange = (value: string, jobDetails?: any) => {
  const activeJob = getActiveJobType();
  if (!activeJob) return;

  const updates: Partial<JobType> = {
    name: value
  };

  // 過去の職種の情報が提供された場合
  if (jobDetails) {
    // 各項目について、既存の値がない場合のみ過去の職種の値を使用
    if (!activeJob.quantity) {
      updates.quantity = jobDetails.quantity;
    }
    if (!activeJob.locations?.length) {
      updates.locations = jobDetails.locations;
    }
    // 年齢範囲は両方とも空の場合のみ更新
    if ((!activeJob.age_range?.[0] && !activeJob.age_range?.[1]) && jobDetails.age_range) {
      updates.age_range = jobDetails.age_range;
    }
    // 検索条件は全ての値が空の場合のみ更新
    if (!activeJob.search_criteria || Object.values(activeJob.search_criteria).every(v => 
      Array.isArray(v) ? v.length === 0 : !v || 
      (typeof v === 'object' && Object.values(v).every(val => !val))
    )) {
      updates.search_criteria = jobDetails.search_criteria;
    }
  }

  onUpdateJobType(activeJobTypeId, updates);
};

// 残りのコードは同じ...