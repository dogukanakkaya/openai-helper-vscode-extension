const MARKDOWN_REGEX = /```[\s\S]*?```/g;
const CHATGPT_REGEX = /^\/\/ @chat.*$/gm;

export const getMarkdowns = (text: string) => {
  const markdownMatches = text.match(MARKDOWN_REGEX);

  return markdownMatches?.map(markdownMatch => markdownMatch.slice(3, -3));
};

export const getChatLines = (text: string) => {
  return text.match(CHATGPT_REGEX);
};