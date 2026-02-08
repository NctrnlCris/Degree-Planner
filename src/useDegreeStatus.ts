import rawTotals from "./totals.json";
import rawLists from "./lists.json";

const totalsData = (rawTotals || []) as any[];
const listsData = (rawLists || []) as any[];

export const creditStore: any = {};
export const listStore: any = {};

totalsData.forEach(item => {
  const metStatus = item.Completed >= item.Required;
  creditStore[item.Name] = {
    completed: item.Completed,
    required: item.Required,
    inProgress: item.InProgress,
    isMet: metStatus
  };
});

listsData.forEach(item => {
  if (item && item.list) {
    const metStatus = item.list.length === 0;
    listStore[item.name] = {
      missing: item.list, 
      isMet: metStatus
    };
  }
});

export const checkCompletion = (name: string): boolean => {
  if (creditStore[name]) return creditStore[name].isMet;
  if (listStore[name]) return listStore[name].isMet;
  return false;
};