const zhAdjectives = [
  '晴空', '流云', '清风', '明月', '星辰',
  '沐雨', '暖阳', '静谧', '涟漪', '霞光',
  '雪霁', '落英', '青梅', '翠竹', '暮色'
];

const zhNouns = [
  '兰', '竹', '菊', '梅', '荷',
  '松', '桂', '柳', '杏', '莲',
  '枫', '桐', '梧', '槐', '椿'
];

const enAdjectives = [
  'Autumn', 'Crystal', 'Dawn', 'Echo', 'Frost',
  'Golden', 'Harmony', 'Iris', 'Jade', 'Luna',
  'Misty', 'Noble', 'Ocean', 'Pearl', 'River'
];

const enNouns = [
  'Brook', 'Cloud', 'Dove', 'Fern', 'Grove',
  'Lake', 'Moon', 'Rain', 'Star', 'Wind',
  'Wood', 'Rose', 'Sky', 'Wave', 'Leaf'
];

export const generateRandomName = (language: string = 'zh'): string => {
  const adjectives = language === 'zh' ? zhAdjectives : enAdjectives;
  const nouns = language === 'zh' ? zhNouns : enNouns;
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return language === 'zh' ? `${adjective}${noun}` : `${adjective}${noun}`;
}; 