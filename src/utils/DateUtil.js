export const formatDate = v => {
  const timestampDate = new Date(v);
  const year = timestampDate.getFullYear();
  const month = timestampDate.getMonth() + 1;
  const day = timestampDate.getDate();
  const dayOfWeek = timestampDate.getDay();
  const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return `${year}年${month}月${day}日 ${weekDays[dayOfWeek]}`;
}

export const formatOnlyDate = v => {
  const timestampDate = new Date(v);
  const year = timestampDate.getFullYear();
  const month = timestampDate.getMonth() + 1;
  const day = timestampDate.getDate();
  return `${year}年${month}月${day}日`;
}