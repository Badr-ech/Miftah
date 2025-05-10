// Script to add React imports to all JSX/TSX files
const fs = require('fs');
const path = require('path');

// Function to recursively find files with specific extensions
const findFiles = (dir, extensions, results = []) => {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        findFiles(filePath, extensions, results);
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  }
  
  return results;
};

// Find all files that might contain JSX in the src directory
const files = findFiles(path.join(process.cwd(), 'src'), ['.jsx', '.tsx', '.js', '.ts']);

// Count of modified files
let modifiedCount = 0;

// Process each file
files.forEach(file => {
  // file is already the full path, don't join with process.cwd() again
  console.log(`Processing ${file}...`);
  const content = fs.readFileSync(file, 'utf8');
  
  // First, check if the file has "from 'react'" which indicates it's already importing React implicitly
  const hasImplicitReactImport = /from ['"]react['"]/.test(content);
  if (hasImplicitReactImport) {
    console.log(`Skipping ${file} - already imports from 'react'`);
    return;
  }
  
  // Skip if already has React import (check for various ways React could be imported)
  if (
    content.includes("import React") || 
    content.includes("import * as React") ||
    content.includes("require('react')") || 
    content.includes('require("react")') ||
    // Next.js might make React available without explicit imports in newer versions
    content.includes("from 'next/react'") ||
    content.includes('from "next/react"')
  ) {
    console.log(`Skipping ${file} - already has explicit React import or equivalent`);
    return;
  }
  
  // Check if the file contains JSX syntax (look for < followed by an uppercase letter, which indicates JSX components)
  const containsJSX = /<[A-Z][A-Za-z]*/.test(content) || 
                      /React\./.test(content) || 
                      /className=/.test(content) ||
                      /<\/[A-Z][A-Za-z]*>/.test(content) ||
                      // Some JSX syntax is more complex
                      /<[a-z]+\s+.*>/.test(content);
  
  if (!containsJSX) {
    console.log(`Skipping ${file} - no JSX detected`);
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
});

console.log(`\nModified ${modifiedCount} files.`);
