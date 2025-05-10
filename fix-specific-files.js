// Script to fix specific files with React import errors
const fs = require('fs');
const path = require('path');

// List of files with known React scope errors - using full paths to avoid issues with special characters
const filesToFix = [
  'c:\\Miftah\\src\\app\\(app)\\study-plan\\page.tsx',
  'c:\\Miftah\\src\\app\\(app)\\teacher\\courses\\new\\new-course-form.tsx',
  'c:\\Miftah\\src\\app\\login\\page.tsx',
  'c:\\Miftah\\src\\app\\logout\\page.tsx',
  'c:\\Miftah\\src\\components\\course-filters.tsx',
  'c:\\Miftah\\src\\components\\dashboards\\admin-dashboard.tsx',
  'c:\\Miftah\\src\\components\\layout\\main-app-nav.tsx',
  'c:\\Miftah\\src\\components\\theme-provider.tsx'
];

// Count of modified files
let modifiedCount = 0;

// Process each file
filesToFix.forEach(file => {
  console.log(`Processing ${file}...`);
  
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Skip if already has React import
    if (
      content.includes("import React") || 
      content.includes("import * as React")
    ) {
      console.log(`Skipping ${file} - already has React import`);
      return;
    }

    // Add React import after "use client" directive if it exists
    let newContent;
    if (content.includes('"use client"') || content.includes("'use client'")) {
      newContent = content.replace(
        /(["']use client["'](\s*\n|\r\n|\n\r|\r))/,
        '$1import React from \'react\';\n'
      );
    } else {
      // Add at the beginning, but after any comments at the top
      const lines = content.split(/\r?\n/);
      let insertIndex = 0;
      
      // Skip past initial comments
      while (insertIndex < lines.length && 
            (lines[insertIndex].trim().startsWith('//') || 
              lines[insertIndex].trim().startsWith('/*') || 
              lines[insertIndex].trim() === '')) {
        insertIndex++;
      }
      
      // Insert the React import
      lines.splice(insertIndex, 0, "import React from 'react';");
      newContent = lines.join('\n');
    }
    
    // Write the modified content back to the file
    fs.writeFileSync(file, newContent);
    modifiedCount++;
    console.log(`Added React import to ${file}`);
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

console.log(`\nModified ${modifiedCount} files.`);
