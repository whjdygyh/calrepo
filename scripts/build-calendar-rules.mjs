import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outputPath = process.env.CALREPO_OUTPUT_PATH
  ? path.resolve(process.env.CALREPO_OUTPUT_PATH)
  : path.join(repoRoot, "data", "seed", "calendar-rules.xlsx");

const sourceRows = [
  ["CN-24-SOLAR-TERMS", "中国二十四节气", "Chinese 24 Solar Terms", "China", "Traditional calendar", "Solar longitude", "Asia/Shanghai", "rule", "publishable_after_engine_validation", "monthly", "China Meteorological Administration / editorial review", "Astronomical calculation must be cross-year verified before iCalendar release."],
  ["CN-TRADITIONAL-FESTIVALS", "中国传统节日", "Chinese Traditional Festivals", "China", "Traditional calendar", "Chinese lunar calendar", "Asia/Shanghai", "rule", "internal_reviewed", "annual", "CalRepo editorial review", "Only deterministic lunar rules are seeded. Regional customs remain separately scoped."],
  ["CN-FIXED-OBSERVANCES", "中国固定公历纪念日", "China Fixed Gregorian Observances", "China", "Public observance", "Gregorian", "Asia/Shanghai", "rule", "internal_reviewed", "annual", "CalRepo editorial review", "This source is not a statutory holiday or adjusted-workday calendar."],
  ["UN-OBSERVANCES", "联合国国际日和国际周", "UN International Days and Weeks", "Global", "International observance", "Official UN schedule", "UTC", "rule", "research_required", "annual", "United Nations / CalRepo editorial review", "All entries listed by the United Nations are catalogued. Date rules are reviewed row by row before release."],
  ["CN-ETHNIC-ZHUANG", "壮族节日", "Zhuang Festivals", "China", "Ethnic", "Mixed / regional", "Asia/Shanghai", "catalog_only", "research_required", "annual", "CalRepo research queue", "Priority P1. Do not publish a national iCalendar feed until scope and rules are verified."],
  ["CN-ETHNIC-UYGHUR", "维吾尔族节日", "Uyghur Festivals", "China", "Ethnic", "Islamic / regional", "Asia/Urumqi", "catalog_only", "research_required", "annual", "CalRepo research queue", "Priority P2. Islamic dates need an explicit calculation and visibility policy."],
  ["CN-ETHNIC-HUI", "回族节日", "Hui Festivals", "China", "Ethnic", "Islamic / regional", "Asia/Shanghai", "catalog_only", "research_required", "annual", "CalRepo research queue", "Priority P3. Islamic dates need an explicit calculation and visibility policy."],
  ["CN-ETHNIC-MIAO", "苗族节日", "Miao Festivals", "China", "Ethnic", "Miao / regional", "Asia/Shanghai", "catalog_only", "research_required", "annual", "CalRepo research queue", "Priority P4. Dates differ by branch and locality."],
  ["CN-ETHNIC-MANCHU", "满族节日", "Manchu Festivals", "China", "Ethnic", "Chinese lunar / regional", "Asia/Shanghai", "catalog_only", "research_required", "annual", "CalRepo research queue", "Priority P5."],
  ["CN-ETHNIC-YI", "彝族节日", "Yi Festivals", "China", "Ethnic", "Yi calendar / regional", "Asia/Shanghai", "catalog_only", "research_required", "annual", "CalRepo research queue", "Priority P6. Yi calendar conversion requires dedicated validation."],
  ["CN-ETHNIC-TUJIA", "土家族节日", "Tujia Festivals", "China", "Ethnic", "Chinese lunar / regional", "Asia/Shanghai", "catalog_only", "research_required", "annual", "CalRepo research queue", "Priority P7."],
  ["CN-ETHNIC-TIBETAN", "藏族节日", "Tibetan Festivals", "China", "Ethnic", "Tibetan calendar / regional", "Asia/Shanghai", "catalog_only", "research_required", "annual", "CalRepo research queue", "Priority P8. Tibetan calendar conversion requires dedicated validation."],
  ["CN-ETHNIC-MONGOLIAN", "蒙古族节日", "Mongolian Festivals", "China", "Ethnic", "Lunisolar / regional", "Asia/Shanghai", "catalog_only", "research_required", "annual", "CalRepo research queue", "Priority P9. Many festivals are locality and event-date dependent."],
  ["CN-ETHNIC-BUYI", "布依族节日", "Bouyei Festivals", "China", "Ethnic", "Chinese lunar / regional", "Asia/Shanghai", "catalog_only", "research_required", "annual", "CalRepo research queue", "Priority P10."],
];

const solarTerms = [
  ["立春", "Start of Spring", 315], ["雨水", "Rain Water", 330], ["惊蛰", "Awakening of Insects", 345], ["春分", "Spring Equinox", 0],
  ["清明", "Clear and Bright", 15], ["谷雨", "Grain Rain", 30], ["立夏", "Start of Summer", 45], ["小满", "Grain Full", 60],
  ["芒种", "Grain in Ear", 75], ["夏至", "Summer Solstice", 90], ["小暑", "Minor Heat", 105], ["大暑", "Major Heat", 120],
  ["立秋", "Start of Autumn", 135], ["处暑", "Limit of Heat", 150], ["白露", "White Dew", 165], ["秋分", "Autumnal Equinox", 180],
  ["寒露", "Cold Dew", 195], ["霜降", "Frost's Descent", 210], ["立冬", "Start of Winter", 225], ["小雪", "Minor Snow", 240],
  ["大雪", "Major Snow", 255], ["冬至", "Winter Solstice", 270], ["小寒", "Minor Cold", 285], ["大寒", "Major Cold", 300],
];

const ruleRows = solarTerms.map(([titleZh, titleEn, longitude], index) => [
  `RULE-CN-TERM-${String(index + 1).padStart(2, "0")}`,
  "CN-24-SOLAR-TERMS",
  titleZh,
  titleEn,
  "solar_term",
  "solar_longitude",
  "Chinese solar calendar",
  "",
  "",
  longitude,
  "Asia/Shanghai",
  "China",
  "All China",
  "reviewed_rule",
  "REF-CN-TERMS",
  "2026-07-21",
  "Astronomical calculation required; do not replace with a fixed Gregorian month/day.",
]);

const lunarRules = [
  ["除夕", "Chinese New Year's Eve", "lunar_month_end", 12, "", "Last day of lunar month 12."],
  ["春节", "Chinese New Year", "lunar_month_day", 1, 1, "Lunar new year, day 1."],
  ["元宵节", "Lantern Festival", "lunar_month_day", 1, 15, "Lunar month 1, day 15."],
  ["龙抬头", "Dragon Head-Raising Day", "lunar_month_day", 2, 2, "Lunar month 2, day 2."],
  ["上巳节", "Shangsi Festival", "lunar_month_day", 3, 3, "Lunar month 3, day 3."],
  ["端午节", "Dragon Boat Festival", "lunar_month_day", 5, 5, "Lunar month 5, day 5."],
  ["七夕", "Qixi Festival", "lunar_month_day", 7, 7, "Lunar month 7, day 7."],
  ["中元节", "Zhongyuan Festival", "lunar_month_day", 7, 15, "Lunar month 7, day 15."],
  ["中秋节", "Mid-Autumn Festival", "lunar_month_day", 8, 15, "Lunar month 8, day 15."],
  ["重阳节", "Double Ninth Festival", "lunar_month_day", 9, 9, "Lunar month 9, day 9."],
  ["腊八节", "Laba Festival", "lunar_month_day", 12, 8, "Lunar month 12, day 8."],
].map(([titleZh, titleEn, ruleType, month, day, note], index) => [
  `RULE-CN-LUNAR-${String(index + 1).padStart(2, "0")}`,
  "CN-TRADITIONAL-FESTIVALS",
  titleZh,
  titleEn,
  "traditional_festival",
  ruleType,
  "Chinese lunar calendar",
  month,
  day,
  "",
  "Asia/Shanghai",
  "China",
  "All China",
  "reviewed_rule",
  "REF-CN-LUNAR",
  "2026-07-21",
  note,
]);

const chinaFixed = [
  ["植树节", "Arbor Day", 3, 12], ["五四青年节", "Youth Day", 5, 4], ["儿童节", "Children's Day", 6, 1],
  ["中国共产党成立纪念日", "Anniversary of the Founding of the Communist Party of China", 7, 1],
  ["中国人民抗日战争胜利纪念日", "Victory Day of the Chinese People's War of Resistance Against Japanese Aggression", 9, 3],
  ["教师节", "Teachers' Day", 9, 10], ["烈士纪念日", "Martyrs' Day", 9, 30], ["国庆节", "National Day", 10, 1],
  ["国家宪法日", "National Constitution Day", 12, 4],
].map(([titleZh, titleEn, month, day], index) => [
  `RULE-CN-GREG-${String(index + 1).padStart(2, "0")}`,
  "CN-FIXED-OBSERVANCES", titleZh, titleEn, "public_observance", "gregorian_month_day", "Gregorian", month, day, "", "Asia/Shanghai", "China", "All China", "reviewed_rule", "REF-CN-FIXED", "2026-07-21", "Observance only. A separate official source is required for statutory holiday and adjusted-workday releases.",
]);

const UN_OBSERVANCES_ZH_URL = "https://www.un.org/zh/observances/list-days-weeks";
const UN_OBSERVANCES_EN_URL = "https://www.un.org/en/observances/list-days-weeks";

function normalizeUnUrl(value) {
  const url = new URL(value, "https://www.un.org");
  return `${url.host}${url.pathname.replace(/^\/(zh|en)\//, "/")}`.replace(/\/$/, "");
}

function parseUnObservances(html) {
  const entries = [];
  const pattern = /views-field-title">[\s\S]*?<a href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?(?:views-field-field-url">[\s\S]*?<a href="([^"]+)")?[\s\S]*?views-field-field-event-date-1">[\s\S]*?content="([^"]+)"/g;
  for (const match of html.matchAll(pattern)) {
    const [, detailUrl, rawTitle, resolutionUrl = "", listedDate] = match;
    const title = rawTitle.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
    if (title && listedDate) entries.push({ title, detailUrl, resolutionUrl, listedDate });
  }
  return entries;
}

async function loadUnObservances() {
  const [zhResponse, enResponse] = await Promise.all([fetch(UN_OBSERVANCES_ZH_URL), fetch(UN_OBSERVANCES_EN_URL)]);
  if (!zhResponse.ok || !enResponse.ok) throw new Error(`Unable to load United Nations observance lists: zh=${zhResponse.status}, en=${enResponse.status}`);
  const [zhEntries, enEntries] = await Promise.all([zhResponse.text(), enResponse.text()]);
  const englishByUrl = new Map(parseUnObservances(enEntries).map((entry) => [normalizeUnUrl(entry.detailUrl), entry.title]));
  const entries = parseUnObservances(zhEntries).map((entry) => ({ ...entry, titleEn: englishByUrl.get(normalizeUnUrl(entry.detailUrl)) ?? "" }));
  if (entries.length < 200) throw new Error(`United Nations source extraction is unexpectedly incomplete: ${entries.length} rows`);
  return entries;
}

const unObservanceRules = (await loadUnObservances()).map((entry, index) => {
  const listedDate = entry.listedDate.slice(0, 10);
  return [
    `RULE-UN-OBS-${String(index + 1).padStart(3, "0")}`,
    "UN-OBSERVANCES", entry.title, entry.titleEn, "international_observance", "un_official_date_rule_pending_review", "UN official schedule", "", "", "", "UTC", "Global", "Worldwide", "needs_verification", "REF-UN-OBSERVANCES", "2026-07-24",
    `官方页面列示日期：${listedDate}；日期规则待审核。详情：${entry.detailUrl}${entry.resolutionUrl ? `；决议/依据：${entry.resolutionUrl}` : ""}`,
  ];
});

const hanBuddhistRules = [
  [2, 8, "释迦牟尼佛出家日"], [2, 15, "释迦牟尼佛涅槃日"], [2, 19, "观世音菩萨圣诞"], [2, 21, "普贤菩萨圣诞"],
  [3, 16, "准提菩萨圣诞"], [4, 4, "文殊菩萨圣诞"], [4, 8, "释迦牟尼佛圣诞"], [4, 15, "佛吉祥日"],
  [4, 28, "药王菩萨圣诞"], [6, 3, "韦驮菩萨圣诞"], [6, 19, "观世音菩萨成道日"], [7, 13, "大势至菩萨圣诞"],
  [7, 15, "佛欢喜日（盂兰盆节）"], [7, 24, "龙树菩萨圣诞"], [7, 30, "地藏菩萨圣诞"], [8, 15, "月光菩萨圣诞"],
  [8, 22, "燃灯佛圣诞"], [9, 19, "观世音菩萨出家日"], [9, 30, "药师琉璃光佛圣诞"], [11, 17, "阿弥陀佛圣诞"],
  [12, 8, "释迦牟尼佛成道日"], [12, 29, "华严菩萨圣诞"],
].map(([month, day, title], index) => [
  `RULE-CN-HAN-BUDDHIST-${String(index + 1).padStart(2, "0")}`, "CN-HAN-BUDDHIST", title, "", "religious_observance", "lunar_month_day", "Chinese lunar calendar", month, day, "", "Asia/Shanghai", "中国及东亚汉传佛教地区", "汉传佛教核心范围", "needs_verification", "REF-6TAIL-LUNAR", "2026-07-23", "依据 6tail/lunar-csharp 日期表；不含斋日、禁忌日和地方寺院专属节日。",
]);

const taoistRules = [
  [1, 1, "天腊之辰"], [1, 9, "玉皇上帝圣诞"], [1, 15, "上元天官圣诞"], [2, 15, "太上老君圣诞"],
  [3, 3, "玄天上帝圣诞"], [3, 15, "财神赵公明圣诞"], [4, 14, "吕祖纯阳祖师圣诞"], [5, 5, "地腊之辰"],
  [5, 13, "关圣帝君降神"], [6, 19, "慈航真人（观音）成道日"], [6, 24, "关圣帝君圣诞"], [7, 15, "中元地官圣诞"],
  [7, 18, "西王母圣诞"], [9, 9, "斗姥元君圣诞"], [10, 15, "下元水官圣诞"], [12, 23, "祭灶王"],
].map(([month, day, title], index) => [
  `RULE-CN-TAOIST-${String(index + 1).padStart(2, "0")}`, "CN-TAOIST", title, "", "religious_observance", "lunar_month_day", "Chinese lunar calendar", month, day, "", "Asia/Shanghai", "中国道教地区", "道教核心范围", "needs_verification", "REF-6TAIL-LUNAR", "2026-07-23", "依据 6tail/lunar-csharp 日期表；不含每月斋日、禁忌日和地方宫观专属神诞。",
]);

const referenceRows = [
  ["REF-CN-TERMS", "二十四节气", "Chinese 24 Solar Terms", "https://www.cma.gov.cn/kppd/kppdqxsj/", "China Meteorological Administration", "Primary public information; implementation must additionally pass cross-year astronomical fixture tests."],
  ["REF-CN-LUNAR", "农历规则", "Chinese lunar calendar rules", "https://gitee.com/6tail/lunar-csharp", "6tail lunar-csharp", "Implementation reference requested by the project. Rule output requires independent regression verification before release."],
  ["REF-CN-FIXED", "中国固定纪念日", "China fixed observances", "https://www.gov.cn/zhengce/content/2013-12/16/content_4164.htm", "State Council of the People's Republic of China", "Observance data only; legal holidays and adjusted workdays are not inferred from this table."],
  ["REF-6TAIL-LUNAR", "6tail 农历佛道规则", "6tail lunar calendar Buddhist and Daoist rules", "https://gitee.com/6tail/lunar-csharp", "6tail", "MIT 开源实现参考；汉传佛教和道教核心规则须继续逐条复核。"],
  ["REF-UN-OBSERVANCES", "联合国国际日和国际周列表", "UN International Days and Weeks", UN_OBSERVANCES_ZH_URL, "United Nations", "全量目录基础数据。每条项目保留详情页、决议/依据链接和页面列示日期；日期规则须逐条审核后才能发布。"],
];

const allRules = [...ruleRows, ...lunarRules, ...chinaFixed, ...hanBuddhistRules, ...taoistRules, ...unObservanceRules];
const listRows = [
  ["rule_type", "release_status", "review_status", "data_mode"],
  ["gregorian_month_day", "publishable_after_engine_validation", "draft", "rule"],
  ["lunar_month_day", "internal_reviewed", "reviewed_rule", "catalog_only"],
  ["lunar_month_end", "research_required", "needs_verification", ""],
  ["solar_longitude", "blocked", "retired", ""],
  ["un_official_date_rule_pending_review", "", "", ""],
];
const sourceNameById = new Map(sourceRows.map((row) => [row[0], row[1]]));
sourceNameById.set("CN-HAN-BUDDHIST", "汉传佛教核心节日");
sourceNameById.set("CN-TAOIST", "道教核心节日");
const releaseLabel = {
  publishable_after_engine_validation: "节气引擎核验后发布",
  internal_reviewed: "已录入，发布前复核",
  research_required: "待研究，暂不发布",
  blocked: "暂不发布",
};
const calendarLabel = {
  "Solar longitude": "太阳黄经",
  "Chinese lunar calendar": "中国农历",
  Gregorian: "公历",
  "Official UN schedule": "联合国官方日程",
  "Mixed / regional": "多种历法 / 地域性",
  "Islamic / regional": "伊斯兰历 / 地域性",
  "Miao / regional": "苗历 / 地域性",
  "Chinese lunar / regional": "中国农历 / 地域性",
  "Yi calendar / regional": "彝历 / 地域性",
  "Tibetan calendar / regional": "藏历 / 地域性",
  "Lunisolar / regional": "阴阳合历 / 地域性",
};
const categoryLabel = {
  "Traditional calendar": "传统历法",
  "Public observance": "公共纪念日",
  "International observance": "国际纪念日",
  Ethnic: "民族节日",
};
const sourceNotes = {
  "CN-24-SOLAR-TERMS": "采用天文计算；必须完成跨年度核验后才能发布订阅源。",
  "CN-TRADITIONAL-FESTIVALS": "仅收录日期明确的农历节日；地方习俗单独界定。",
  "CN-FIXED-OBSERVANCES": "这里只是固定纪念日，不代表法定放假或调休安排。",
  "UN-OBSERVANCES": "联合国官方目录的全量基础数据，先完成逐条日期规则审核后再生成或发布。",
};
const researchReason = {
  "CN-ETHNIC-ZHUANG": "适用地区与具体日期规则尚未核验，不能作为全国统一订阅源发布。",
  "CN-ETHNIC-UYGHUR": "伊斯兰历日期需要明确计算规则和地区显示政策。",
  "CN-ETHNIC-HUI": "伊斯兰历日期需要明确计算规则和地区显示政策。",
  "CN-ETHNIC-MIAO": "不同支系和地区的苗历日期不同。",
  "CN-ETHNIC-MANCHU": "需要先确认适用地区和节日是否采用统一农历规则。",
  "CN-ETHNIC-YI": "彝历换算需要专用算法和跨年度验证。",
  "CN-ETHNIC-TUJIA": "需要先确认适用地区和节日是否采用统一农历规则。",
  "CN-ETHNIC-TIBETAN": "藏历换算需要专用算法和跨年度验证。",
  "CN-ETHNIC-MONGOLIAN": "许多节日由地区和当年活动日期决定。",
  "CN-ETHNIC-BUYI": "需要先确认适用地区和节日是否采用统一农历规则。",
};
const ruleDescription = (row) => {
  if (row[5] === "solar_longitude") return `太阳黄经 ${row[9]}°（中国标准时间）`;
  if (row[5] === "lunar_month_end") return `农历 ${row[7]} 月最后一天`;
  if (row[5] === "lunar_month_day") return `农历 ${row[7]} 月 ${row[8]} 日`;
  if (row[5] === "un_official_date_rule_pending_review") return row[16].match(/官方页面列示日期：([^；]+)/)?.[1] ?? "联合国页面日期待审核";
  return `每年 ${row[7]} 月 ${row[8]} 日`;
};
const eventMasterRows = allRules.map((row, index) => [
  index + 1,
  sourceNameById.get(row[1]),
  row[2],
  row[3],
  row[11] === "Global" ? "全球" : "中国",
  calendarLabel[row[6]] ?? row[6],
  row[5],
  ruleDescription(row),
  row[10],
  row[13] === "reviewed_rule" ? "已录入，发布前复核" : "待规则审核",
  row[14],
  row[15],
  row[16],
]);
const researchRows = sourceRows.filter((row) => row[7] === "catalog_only").map((row) => [
  row[11].match(/Priority (P\d+)/)?.[1] ?? "",
  row[1],
  calendarLabel[row[5]] ?? row[5],
  "待研究，暂不发布",
  researchReason[row[0]],
  "核实权威来源、适用地区与日期算法后再新增规则",
]);
const sourceDisplayRows = sourceRows.map((row) => [
  row[0], row[1], row[2], row[3] === "Global" ? "全球" : "中国", categoryLabel[row[4]] ?? row[4], calendarLabel[row[5]] ?? row[5], row[6], row[7] === "rule" ? "已有规则" : "仅建目录", releaseLabel[row[8]], row[9] === "monthly" ? "每月" : "每年", row[10], sourceNotes[row[0]] ?? researchReason[row[0]],
]);
const referenceDisplayRows = [
  ["REF-CN-TERMS", "二十四节气", "Chinese 24 Solar Terms", "https://www.cma.gov.cn/kppd/kppdqxsj/", "中国气象局", "公开资料来源；发布前还需通过跨年度天文日期测试。"],
  ["REF-CN-LUNAR", "农历规则", "Chinese lunar calendar rules", "https://gitee.com/6tail/lunar-csharp", "6tail lunar-csharp", "项目指定的实现参考；发布前需要独立回归验证。"],
  ["REF-CN-FIXED", "中国固定纪念日", "China fixed observances", "https://www.gov.cn/zhengce/content/2013-12/16/content_4164.htm", "中华人民共和国国务院", "仅用于固定纪念日；法定放假和调休不能从本表推断。"],
  ["REF-UN-OBSERVANCES", "联合国国际日和国际周列表", "UN International Days and Weeks", UN_OBSERVANCES_ZH_URL, "联合国", "全量目录基础数据。每条项目的日期规则须逐条审核后才能发布。"],
];
const googleIcalUrl = (calendarId) => `https://calendar.google.com/calendar/ical/${calendarId}%23holiday%40group.v.calendar.google.com/public/basic.ics`;
const verifiedGoogleSources = [
  ["SRC-CN-GOOGLE", "国家/地区", "中国公共假日", "中国法定及传统节日", "中国", "", "", "公历与农历混合", "是", "zh.china", 379],
  ["SRC-US-GOOGLE", "国家/地区", "美国公共假日", "美国全国公共假日", "美国", "", "", "公历", "是", "en.usa", 317],
  ["SRC-CA-GOOGLE", "国家/地区", "加拿大公共假日", "加拿大公共假日", "加拿大", "", "", "公历", "是", "en.canadian", 326],
  ["SRC-MX-GOOGLE", "国家/地区", "墨西哥公共假日", "墨西哥公共假日", "墨西哥", "", "", "公历", "是", "en.mexican", 221],
  ["SRC-BR-GOOGLE", "国家/地区", "巴西公共假日", "巴西公共假日", "巴西", "", "", "公历", "是", "en.brazilian", 275],
  ["SRC-RU-GOOGLE", "国家/地区", "俄罗斯公共假日", "俄罗斯公共假日", "俄罗斯", "", "", "公历", "是", "en.russian", 196],
  ["SRC-FR-GOOGLE", "国家/地区", "法国公共假日", "法国公共假日", "法国", "", "", "公历", "是", "en.french", 209],
  ["SRC-GB-GOOGLE", "国家/地区", "英国公共假日", "英国公共假日", "英国", "", "", "公历", "是", "en.uk", 244],
  ["SRC-DE-GOOGLE", "国家/地区", "德国公共假日", "德国公共假日", "德国", "", "", "公历", "是", "en.german", 462],
  ["SRC-JP-GOOGLE", "国家/地区", "日本公共假日", "日本公共假日", "日本", "", "", "公历", "是", "en.japanese", 297],
  ["SRC-KR-GOOGLE", "国家/地区", "韩国公共假日", "韩国公共假日", "韩国", "", "", "公历与阴阳合历", "是", "en.south_korea", 280],
  ["SRC-IN-GOOGLE", "国家/地区", "印度公共假日", "印度公共假日", "印度", "", "", "多种历法", "是", "en.indian", 535],
  ["SRC-VN-GOOGLE", "国家/地区", "越南公共假日", "越南公共假日（含越南春节）", "越南", "", "", "公历与越南历", "是", "en.vietnamese", 216],
  ["SRC-SG-GOOGLE", "国家/地区", "新加坡公共假日", "新加坡公共假日", "新加坡", "", "", "公历与多宗教历法", "是", "en.singapore", 277],
  ["SRC-MY-GOOGLE", "国家/地区", "马来西亚公共假日", "马来西亚公共假日", "马来西亚", "", "", "公历与多宗教历法", "是", "en.malaysia", 334],
  ["SRC-ID-GOOGLE", "国家/地区", "印度尼西亚公共假日", "印度尼西亚公共假日", "印度尼西亚", "", "", "公历与多宗教历法", "是", "en.indonesian", 175],
  ["SRC-CHRISTIAN-GOOGLE", "宗教/教派", "基督教节日", "综合基督教节日，含部分天主教礼仪节期", "全球", "基督教（非天主教专属）", "", "公历与复活节规则", "是", "en.christian", 280],
].map(([id, category, name, scope, country, religion, people, calendarSystem, hasSubscription, googleId, eventCount]) => [
  id, category, name, scope, country, religion, people, calendarSystem, hasSubscription, googleIcalUrl(googleId), "Google Calendar", `C：2026-07-22 实测 HTTP 200、text/calendar、${eventCount} 个事件；可直接订阅，许可与长期维护仍待审计。`, "否，待许可审计", "直接采用：向用户提供原链接", "上游事件可用；CalRepo 不自行修改事件", "审计许可、事件覆盖范围与年度更新稳定性", "2026-07-22",
]);
const plannedOrResearchSources = [
  ["SRC-CN-SOLAR-TERMS", "民族/文化", "中国二十四节气", "中国传统时间体系", "中国", "", "中华文化", "太阳黄经", "是", "https://raw.githubusercontent.com/oooldtoy/chinese_calender/main/twenty_four_solar.ics", "oooldtoy / GitHub", "C-：2026-07-23 实测 HTTP 200、72 个事件；第三方源，仅作直订候选。", "否，禁止镜像直至许可明确", "直接采用候选；CalRepo 自建源继续独立验证", "外部源可订阅，CalRepo 自建规则未就绪", "持续观察第三方更新；完成自建跨年验证", "2026-07-23"],
  ["SRC-CN-TRADITIONAL", "民族/文化", "中国传统节日", "春节、端午、中秋等中国传统节日", "中国", "", "中华文化", "中国农历", "是", "https://raw.githubusercontent.com/oooldtoy/chinese_calender/main/festival.ics", "oooldtoy / GitHub", "C-：2026-07-23 实测 HTTP 200、86 个事件；第三方源，仅作直订候选。", "否，禁止镜像直至许可明确", "直接采用候选；CalRepo 自建源继续独立验证", "外部源可订阅，CalRepo 自建规则未就绪", "持续观察第三方更新；核验节日范围和译名", "2026-07-23"],
  ["SRC-CN-LEGAL", "国家/地区", "中国法定节假日与调休", "中国年度法定放假与工作日调整", "中国", "", "", "官方年度公告", "是", "https://yangh9.github.io/ChinaCalendar/cal_holiday.ics", "YangH9 / GitHub Pages", "C-：2026-07-23 实测 HTTP 200、72 个事件；第三方源，含节假日与调休候选。", "否，禁止镜像直至许可明确", "直接采用候选；CalRepo 继续按政府年度公告核验", "外部源可订阅，CalRepo 自建规则未就绪", "持续观察更新；按中国政府网公告逐项核验", "2026-07-23"],
  ["SRC-UN-OBSERVANCES", "世界通用/国际组织", "联合国国际日和国际周", "联合国官方目录的全部国际日和国际周项目", "全球", "", "", "联合国官方日程", "否", "https://www.un.org/zh/observances/list-days-weeks", "联合国 / CalRepo", "A：联合国官方目录可访问；未发现可直接订阅 ICS。已导入全量基础数据，日期规则尚待逐条审核。", "是，自建发布", "自建开源", "全量项目已入表；固定、相对规则和年度公告项目须逐条标定", "先由编辑审核日期规则、适用范围和名称，再按规则类型分批生成", "2026-07-24"],
  ["SRC-WORLD-CULTURE", "世界通用/国际组织", "世界通用民俗纪念日", "情人节、程序员节、网购节等非官方或多来源纪念日", "全球", "", "", "多种规则", "否", "", "CalRepo", "未评级：范围、命名和文化口径未统一。", "不适用", "待研究", "部分规则已知，但收录标准未定", "先制定收录边界和权威来源门槛", "2026-07-22"],
  ["SRC-TH-RESEARCH", "国家/地区", "泰国公共假日", "泰国公共假日与佛历相关节期", "泰国", "", "", "公历与佛历", "是", "https://www.officeholidays.com/ics-all/thailand", "OfficeHolidays（非官方）", "C-：2026-07-22 实测 HTTP 200、text/calendar、51 个事件（2026-2027）；许可、权威性与再发布权未审计。Google 候选已排除。", "否，禁止镜像直至许可明确", "直接采用外部候选；同步研究泰国官方年度公告后自建", "外部源可订阅，CalRepo 自建规则未就绪", "审计许可；定位泰国政府年度公告并逐项核验", "2026-07-23"],
  ["SRC-CATHOLIC", "宗教/教派", "通用罗马礼日历", "General Roman Calendar；不含国家、教区和修会专属庆日", "全球", "天主教（罗马礼）", "", "公历与复活节规则", "是", "https://litcal.johnromanodorazio.com/api/v5/calendar?return_type=ICS&year_type=CIVIL", "Liturgical Calendar API（第三方）", "C：2026-07-23 实测 HTTP 200、text/calendar、548 个事件（2026）；梵蒂冈未发现通用 ICS。", "否，禁止镜像直至许可明确", "直接采用外部候选；CalRepo 自建通用罗马礼源继续验证", "外部源可订阅，CalRepo 自建规则未就绪", "由用户协助核验中文译名、范围和地方庆日边界", "2026-07-23"],
  ["SRC-ANGLICAN", "宗教/教派", "圣公会日历", "圣公会礼仪节期", "全球", "圣公会", "", "公历与复活节规则", "否", "https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year/calendar", "英格兰教会", "B：官方礼仪年页面可访问，但本轮未找到可直接订阅 ICS；页面不是订阅源。", "否", "继续检索；无 ICS 则自建候选", "规则和教区差异待审计", "继续用英语及英国教会术语检索 ICS", "2026-07-23"],
  ["SRC-ORTHODOX", "宗教/教派", "东正教日历（希腊传统）", "希腊正教传统圣徒与礼仪日历；不代表所有东正教分支", "全球", "东正教（希腊传统）", "", "儒略历与复活节规则", "是", "https://129.158.245.227.nip.io/api/v1/saints.ics?tradition=greek&start=2026-01-01&days=365", "nikolareljin / Orthodox Calendar", "C-：2026-07-23 实测 HTTP 200、text/calendar、3,106 个事件；第三方单一传统源。", "否，禁止镜像直至许可明确", "直接采用候选；其他东正教传统需分源登记", "外部源可订阅，CalRepo 自建规则未就绪", "持续观察服务可用性；拆分教会和历法分支", "2026-07-23"],
  ["SRC-ISLAM", "宗教/教派", "伊斯兰教日历", "伊斯兰教主要节日", "全球", "伊斯兰教", "", "伊斯兰历", "是", googleIcalUrl("en.islamic"), "Google Calendar", "C：2026-07-23 实测 HTTP 200、text/calendar、91 个事件；各国观月与法定日期仍可能不同。", "否，待许可审计", "直接采用：向用户提供原链接", "外部源可订阅，CalRepo 不自行修改事件", "持续观察覆盖范围；后续按国家建立变体源", "2026-07-23"],
  ["SRC-BUDDHIST-HAN", "宗教/教派", "汉传佛教核心节日", "汉传佛教核心节日；不含斋日、禁忌日和地方寺院专属活动", "中国及东亚汉传佛教地区", "汉传佛教", "", "中国农历", "否", "https://gitee.com/6tail/lunar-csharp", "CalRepo / KeepOn 自建规则", "无可直接订阅的外部 ICS；Google 候选实测 HTTP 500。已依据 MIT 许可的 6tail/lunar-csharp 建立可审计的核心日期规则，宗派和寺院差异仍需持续复核。", "是，自建发布", "CalRepo 自建开源源；不镜像第三方 ICS", "核心日期按中国农历生成，规则范围不代表全部佛教宗派", "逐条核验寺院、佛教协会及传统历法资料；维护中文译名和范围说明", "2026-07-23"],
  ["SRC-TAOIST", "宗教/教派", "道教核心节日", "道教核心节日；不含每月斋日、禁忌日和地方宫观专属神诞", "中国道教地区", "道教", "", "中国农历", "否", "https://gitee.com/6tail/lunar-csharp", "CalRepo / KeepOn 自建规则", "无可直接订阅的外部 ICS；Google 候选实测 HTTP 500。已依据 MIT 许可的 6tail/lunar-csharp 建立可审计的核心日期规则，不代表所有道派和宫观口径。", "是，自建发布", "CalRepo 自建开源源；不镜像第三方 ICS", "核心日期按中国农历生成，地方宫观和道派可能存在差异", "逐条核验道教协会、道历资料和宫观传统；维护中文译名和范围说明", "2026-07-23"],
  ["SRC-ETHNIC-ZHUANG", "民族/文化", "壮族节日", "壮族传统节日", "中国", "", "壮族（P1）", "中国农历与地域择日", "否", "", "待调研", "未评级：统一公开 ICS 未确认。", "否", "待研究后自建候选", "部分规则已知，地区范围待审计", "按广西及云南等区域拆分规则", "2026-07-22"],
  ["SRC-ETHNIC-UYGHUR", "民族/文化", "维吾尔族节日", "维吾尔族传统节日", "中国", "伊斯兰教", "维吾尔族（P2）", "伊斯兰历与公历", "否", "", "待调研", "未评级：统一公开 ICS 未确认。", "否", "待研究", "伊斯兰日期需明确计算口径", "区分诺鲁孜与伊斯兰节日规则", "2026-07-22"],
  ["SRC-ETHNIC-HUI", "民族/文化", "回族节日", "回族传统节日", "中国", "伊斯兰教", "回族（P3）", "伊斯兰历", "否", "", "待调研", "未评级：统一公开 ICS 未确认。", "否", "待研究", "伊斯兰日期需明确计算口径", "与伊斯兰通用日历建立关联和差异说明", "2026-07-22"],
  ["SRC-ETHNIC-MIAO", "民族/文化", "苗族节日", "苗族传统节日", "中国", "", "苗族（P4）", "苗历与地域规则", "否", "", "待调研", "未评级：不同支系、地区日期差异显著。", "否", "待研究", "不能作为全国单一日期发布", "优先核验黔东南等主要地区", "2026-07-22"],
  ["SRC-ETHNIC-MANCHU", "民族/文化", "满族节日", "满族传统节日", "中国", "", "满族（P5）", "中国农历与地域规则", "否", "", "待调研", "未评级：统一公开 ICS 未确认。", "否", "待研究后自建候选", "部分日期可按农历确定", "核验节日地区范围与规则", "2026-07-22"],
  ["SRC-ETHNIC-YI", "民族/文化", "彝族节日", "彝族传统节日", "中国", "", "彝族（P6）", "彝历与地域规则", "否", "", "待调研", "未评级：彝历换算需要专用算法。", "否", "待研究", "不能用中国农历替代彝历", "核验彝历算法和重点地区资料", "2026-07-22"],
  ["SRC-ETHNIC-TUJIA", "民族/文化", "土家族节日", "土家族传统节日", "中国", "", "土家族（P7）", "中国农历与地域规则", "否", "", "待调研", "未评级：统一公开 ICS 未确认。", "否", "待研究后自建候选", "部分日期可按农历确定", "核验湘鄂渝黔地区差异", "2026-07-22"],
  ["SRC-ETHNIC-TIBETAN", "民族/文化", "藏族节日", "藏族传统节日", "中国", "藏传佛教", "藏族（P8）", "藏历", "否", "", "待调研", "未评级：藏历换算和地域传统需要单独处理。", "否", "待研究", "不能以中国农历替代藏历", "核验藏历算法和区域范围", "2026-07-22"],
  ["SRC-ETHNIC-MONGOLIAN", "民族/文化", "蒙古族节日", "蒙古族传统节日", "中国", "", "蒙古族（P9）", "阴阳合历与活动择日", "否", "", "待调研", "未评级：部分节日由地区和活动日期决定。", "否", "待研究", "日期不完全可规则化", "先拆分固定、可计算和公告三类节日", "2026-07-22"],
  ["SRC-ETHNIC-BUYI", "民族/文化", "布依族节日", "布依族传统节日", "中国", "", "布依族（P10）", "中国农历与地域规则", "否", "", "待调研", "未评级：统一公开 ICS 未确认。", "否", "待研究后自建候选", "部分日期可按农历确定", "核验贵州重点地区规则", "2026-07-22"],
];
const sourceRegistryRows = [...verifiedGoogleSources, ...plannedOrResearchSources];

const subscriptionStatuses = new Set(["是", "否"]);
const invalidSubscriptionRows = sourceRegistryRows.filter((row) => !subscriptionStatuses.has(row[8]));
if (invalidSubscriptionRows.length > 0) {
  throw new Error(`是否有订阅源只能填写“是”或“否”：${invalidSubscriptionRows.map((row) => row[0]).join(", ")}`);
}

const workbook = Workbook.create();
const readme = workbook.worksheets.add("先看这里");
const sources = workbook.worksheets.add("日历源目录");
const events = workbook.worksheets.add("节日总表");

for (const sheet of [readme, events, sources]) sheet.showGridLines = false;

readme.getRange("A1:B1").merge();
readme.getRange("A1").values = [["CalRepo 日历规则数据库"]];
readme.getRange("A3:B10").values = [
  ["老板只需要看", "1. 日历源目录：一行一个日历源，已可直接订阅、自建、待研究和下一步都在这里。2. 节日总表：所有自建源的节日及日期规则都在这里。"],
  ["不需要单独看的表", "没有。原来的“待研究”“规则原表（高级）”“参考资料”“下拉选项”均已合并，不再单独出现。"],
  ["外部稳定订阅源", "只在“日历源目录”维护来源、质量和范围；不抄录其上游 ICS 的每一个事件，避免重复维护。"],
  ["自建源节日", "全部维护在“节日总表”：二十四节气、中国传统节日、中国固定公历纪念日、汉传佛教、道教、联合国国际日和国际周。"],
  ["联合国日期", "官方页面的列示日期已保存，但在逐条审核前不推断为固定日期；审核后在“日期规则类型”和“规则/日期说明”中确认。"],
  ["地区写法", "中国国家级日历统一写“中国”。台湾、香港、澳门不作为主权国家列示，需要细分时用“中国台湾”“中国香港”“中国澳门”。"],
  ["本次更新时间", "2026-07-24"],
  ["本次自建节日数量", String(eventMasterRows.length)],
];
readme.getRange("A12:B14").values = [
  ["工作表", "你要用它做什么"],
  ["日历源目录", "查看和审核所有日历源。待研究、不稳定、不可镜像、下一步动作均在同一行。"],
  ["节日总表", "审核所有自建节日：一行一个节日，日期规则、时区、依据、状态和备注都在同一行。"],
];

const eventHeaders = ["序号", "日历源", "节日名称", "英文名称", "适用地区", "使用历法", "日期规则类型", "规则/日期说明", "时区", "审核状态", "依据编号", "最近复核", "备注（含官方链接）"];
events.getRange(`A1:M${eventMasterRows.length + 1}`).values = [eventHeaders, ...eventMasterRows];

const sourceHeaders = ["源编号", "一级分类", "日历源名称", "覆盖对象", "国家/地区", "宗教/教派", "民族/文化", "使用历法", "是否有订阅源", "订阅/原始链接", "提供方", "实测与质量", "可否镜像发布", "CalRepo 处理策略", "规则状态", "下一步", "最近核验"];
sources.getRange(`A1:Q${sourceRegistryRows.length + 1}`).values = [sourceHeaders, ...sourceRegistryRows];

const headerStyle = { fill: "#0F766E", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true };
const titleStyle = { fill: "#134E4A", font: { bold: true, color: "#FFFFFF", size: 16 }, horizontalAlignment: "left", verticalAlignment: "center" };
const subHeaderStyle = { fill: "#CCFBF1", font: { bold: true, color: "#134E4A" }, horizontalAlignment: "left", verticalAlignment: "center", wrapText: true };

readme.getRange("A1:B1").format = titleStyle;
readme.getRange("A1:B1").format.rowHeight = 28;
readme.getRange("A3:A10").format = subHeaderStyle;
readme.getRange("A12:B12").format = headerStyle;
readme.getRange("A3:B10").format.wrapText = true;
readme.getRange("A12:B14").format.wrapText = true;
readme.getRange("A1").format.columnWidth = 24;
readme.getRange("B1").format.columnWidth = 104;
readme.getRange("A3:A14").format.columnWidth = 22;
readme.getRange("B3:B14").format.columnWidth = 105;
readme.getRange("A3:B14").format.borders = { preset: "outside", style: "thin", color: "#99F6E4" };

for (const [sheet, range] of [[sources, `A1:Q${sourceRegistryRows.length + 1}`], [events, `A1:M${eventMasterRows.length + 1}`]]) {
  sheet.getRange(range).getRow(0).format = headerStyle;
  sheet.getRange(range).format.verticalAlignment = "center";
  sheet.getRange(range).format.wrapText = true;
  sheet.getRange(range).format.borders = { preset: "outside", style: "thin", color: "#99F6E4" };
  sheet.freezePanes.freezeRows(1);
}
sources.freezePanes.freezeColumns(3);
events.freezePanes.freezeColumns(3);

sources.tables.add(`A1:Q${sourceRegistryRows.length + 1}`, true, "CalendarSourceRegistry");
events.tables.add(`A1:M${eventMasterRows.length + 1}`, true, "FestivalMaster");

events.getRange("A:M").format.columnWidth = 16;
events.getRange("B:B").format.columnWidth = 24;
events.getRange("C:D").format.columnWidth = 28;
events.getRange("E:H").format.columnWidth = 26;
events.getRange("J:J").format.columnWidth = 20;
events.getRange("M:M").format.columnWidth = 72;
sources.getRange("A:Q").format.columnWidth = 16;
sources.getRange("A:A").format.columnWidth = 24;
sources.getRange("C:D").format.columnWidth = 30;
sources.getRange("E:G").format.columnWidth = 20;
sources.getRange("H:H").format.columnWidth = 24;
sources.getRange("I:I").format.columnWidth = 18;
sources.getRange("J:J").format.columnWidth = 64;
sources.getRange("K:K").format.columnWidth = 25;
sources.getRange("L:L").format.columnWidth = 58;
sources.getRange("M:O").format.columnWidth = 30;
sources.getRange("P:P").format.columnWidth = 48;
sources.getRange("Q:Q").format.columnWidth = 18;
sources.getRange(`I2:I${sourceRegistryRows.length + 1}`).conditionalFormats.add("containsText", { text: "否", format: { fill: "#FEF3C7", font: { color: "#92400E" } } });
events.getRange(`J2:J${eventMasterRows.length + 1}`).conditionalFormats.add("containsText", { text: "待规则审核", format: { fill: "#FEE2E2", font: { color: "#991B1B" } } });

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`Wrote ${outputPath}`);
