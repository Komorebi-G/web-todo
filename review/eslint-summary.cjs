// 只汇总 ESLint 的真实结果，便于在成功时也看到数量。
module.exports = (results) => {
  const errors = results.reduce((sum, file) => sum + file.errorCount, 0);
  const warnings = results.reduce((sum, file) => sum + file.warningCount, 0);
  const lines = results.map((file) => {
    const name = file.filePath.split(/[\\/]/).slice(-2).join('/');
    const messages = file.messages.map((m) => `  ${m.line}:${m.column} ${m.message}`);
    return [`${name}: ${file.errorCount} error(s), ${file.warningCount} warning(s)`, ...messages].join('\n');
  });
  return [...lines, `${errors} error(s), ${warnings} warning(s)`].join('\n') + '\n';
};
