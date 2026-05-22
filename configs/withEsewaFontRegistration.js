const { withAppDelegate } = require('@expo/config-plugins');

module.exports = function withEsewaFontRegistration(config) {
  return withAppDelegate(config, async (delegateConfig) => {
    const filePath = delegateConfig.modResults.path;
    // Only process Swift files
    if (!filePath.endsWith('.swift')) {
      return delegateConfig;
    }

    let contents = delegateConfig.modResults.contents;
    const lines = contents.split('\n');

    // ----- 1. Insert import EsewaSDK before import ReactAppDependencyProvider -----
    const importStatement = 'import EsewaSDK';
    // Check if already present
    if (!contents.includes(importStatement)) {
      const targetImport = 'import ReactAppDependencyProvider';
      let targetIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(targetImport)) {
          targetIndex = i;
          break;
        }
      }

      if (targetIndex !== -1) {
        // Insert before that line
        lines.splice(targetIndex, 0, importStatement);
        console.log('Inserted import EsewaSDK');
      } else {
        console.warn('Could not find "import ReactAppDependencyProvider" – import not inserted.');
      }
    }

    // ----- 2. Insert UIFont.loadFonts() before the super return line -----
    const methodCall = 'UIFont.loadFonts()';
    // Check if already present (optional)
    if (!contents.includes(methodCall)) {
      const returnLinePattern = /return super\.application\(application,\s*didFinishLaunchingWithOptions:\s*launchOptions\)/;
      let returnIndex = -1;
      let returnIndent = '';

      for (let i = 0; i < lines.length; i++) {
        if (returnLinePattern.test(lines[i])) {
          returnIndex = i;
          // Capture indentation
          const match = lines[i].match(/^(\s*)/);
          returnIndent = match ? match[1] : '';
          break;
        }
      }

      if (returnIndex !== -1) {
        // Insert before that line with the same indentation
        lines.splice(returnIndex, 0, returnIndent + methodCall);
        console.log('Inserted UIFont.loadFonts() before return super...');
      } else {
        console.warn('Could not find the super return line – method call not inserted.');
      }
    }

    delegateConfig.modResults.contents = lines.join('\n');
    return delegateConfig;
  });
};