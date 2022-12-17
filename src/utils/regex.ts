const MARKDOWN_REGEX = /```[\s\S]*?```/g;
const GENERATOR_REGEX = /^\/\/ @ai.*$/gm;
// const CODE_TAGS_REGEX = /^<code>([\s\S]*?)<\/code>/gm;

export const getMarkdowns = (text: string) => {
  const markdownMatches = text.match(MARKDOWN_REGEX);

  return markdownMatches?.map(markdownMatch => markdownMatch.slice(3, -3));
};

export const getGeneratorLines = (text: string) => {
  return text.match(GENERATOR_REGEX);
};

// export const getCodeTags = (text: string) => {
//   const matches = text.match(CODE_TAGS_REGEX);
//   return matches ? matches.map(match => match.slice(6, -7)) : [];
// };

export const unescapeChars = (text: string) => {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
};