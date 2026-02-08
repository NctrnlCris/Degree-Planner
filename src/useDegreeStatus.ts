import { useState } from 'react';
import rawTotals from "./totals.json";
import rawLists from "./lists.json";

const formatData = (totalsData: any[], listsData: any[]) => {
  const newCreditStore: any = {};
  const newListStore: any = {};

  if (totalsData && Array.isArray(totalsData)) {
    totalsData.forEach(item => {
      const completed = item.Completed ?? item.Completed_Credits ?? 0;
      const required = item.Required ?? item.Required_Credits ?? 0;
      const inProgress = item.InProgress ?? item.InProgress_Credits ?? 0;
      const key = item.Name || item.Requirement;
      if (key) {
        newCreditStore[key] = {
          completed,
          required,
          inProgress,
          isMet: required > 0 ? completed >= required : false,
        };
      }
    });

    // Ensure "Total Credits" exists for header - use highest-required requirement if missing
    if (!newCreditStore["Total Credits"]) {
      const entries = Object.entries(newCreditStore) as [string, { required: number }][];
      if (entries.length > 0) {
        const totalEntry = entries.reduce((max, [k, v]) =>
          (v.required > (max[1]?.required ?? 0) ? [k, v] : max)
        );
        if (totalEntry[0]) {
          newCreditStore["Total Credits"] = newCreditStore[totalEntry[0]];
        }
      }
    }
  }

  if (listsData && Array.isArray(listsData)) {
    listsData.forEach(item => {
      if (item && item.list) {
        const list = Array.isArray(item.list) ? item.list : [];
        newListStore[item.name] = { missing: list, isMet: list.length === 0 };
      }
    });
  }

  return { newCreditStore, newListStore };
};

export function useDegreeStatus() {
  // 1. Initialize with your local JSON files
  const initial = formatData(rawTotals as any[], rawLists as any[]);
  
  const [creditStore, setCreditStore] = useState(initial.newCreditStore);
  const [listStore, setListStore] = useState(initial.newListStore);

  // 2. This function is called after the Python upload succeeds
  const updateDashboard = (pythonData: any) => {
    // pythonData.credits and pythonData.lists come from your Flask app
    const updated = formatData(pythonData.credits, pythonData.lists);
    
    setCreditStore(updated.newCreditStore);
    setListStore(updated.newListStore);
  };

  return { creditStore, listStore, updateDashboard };
}