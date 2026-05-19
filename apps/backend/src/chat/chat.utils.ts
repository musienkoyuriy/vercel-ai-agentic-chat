export const markdownToText = (md: string): string => {
  return (
    md
      // remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // remove inline code
      .replace(/`([^`]*)`/g, '$1')
      // remove images
      .replace(/!\[.*?\]\(.*?\)/g, '')
      // remove links but keep text
      .replace(/\[([^\]]+)\]\((.*?)\)/g, '$1')
      // remove headings, bold, italic markers
      .replace(/[#*_~>`-]/g, '')
      // normalize whitespace
      .replace(/\n\s*\n/g, '\n')
      .trim()
  );
};
