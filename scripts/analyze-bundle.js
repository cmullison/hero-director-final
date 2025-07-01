#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist', 'js');
const cssPath = path.join(__dirname, '..', 'dist', 'assets');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  if (!fs.existsSync(distPath)) {
    console.log('❌ Build files not found. Run "npm run build" first.');
    return;
  }

  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  
  let cssFiles = [];
  if (fs.existsSync(cssPath)) {
    const cssAssets = fs.readdirSync(cssPath);
    cssFiles = cssAssets.filter(file => file.endsWith('.css'));
  }
  
  let totalJSSize = 0;
  let totalCSSSize = 0;
  
  console.log('\n📊 Bundle Analysis Report\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Analyze JavaScript files
  console.log('\n🟨 JavaScript Chunks:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━');
  
  const jsChunks = jsFiles.map(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalJSSize += size;
    
    // Extract chunk name from filename
    const chunkName = file.replace(/^(.+?)-[a-f0-9]+\.js$/, '$1');
    
    return { file, chunkName, size };
  }).sort((a, b) => b.size - a.size);
  
  jsChunks.forEach(({ file, chunkName, size }) => {
    const sizeFormatted = formatBytes(size);
    const status = size > 250000 ? '🔴' : size > 100000 ? '🟡' : '🟢';
    console.log(`${status} ${chunkName.padEnd(20)} ${sizeFormatted.padStart(10)} (${file})`);
  });
  
  // Analyze CSS files
  if (cssFiles.length > 0) {
    console.log('\n🟦 CSS Files:');
    console.log('━━━━━━━━━━━━━');
    
    const cssChunks = cssFiles.map(file => {
      const filePath = path.join(cssPath, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      totalCSSSize += size;
      
      return { file, size };
    }).sort((a, b) => b.size - a.size);
    
    cssChunks.forEach(({ file, size }) => {
      const sizeFormatted = formatBytes(size);
      const status = size > 50000 ? '🔴' : size > 20000 ? '🟡' : '🟢';
      console.log(`${status} ${file.padEnd(30)} ${sizeFormatted.padStart(10)}`);
    });
  }
  
  // Summary
  console.log('\n📈 Summary:');
  console.log('━━━━━━━━━━━');
  console.log(`Total JavaScript: ${formatBytes(totalJSSize)}`);
  console.log(`Total CSS:        ${formatBytes(totalCSSSize)}`);
  console.log(`Total Assets:     ${formatBytes(totalJSSize + totalCSSSize)}`);
  console.log(`Number of JS chunks: ${jsFiles.length}`);
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('━━━━━━━━━━━━━━━━━━━');
  
  const largeChunks = jsChunks.filter(chunk => chunk.size > 250000);
  if (largeChunks.length > 0) {
    console.log('🔴 Large chunks detected (>250KB):');
    largeChunks.forEach(chunk => {
      console.log(`   • ${chunk.chunkName} (${formatBytes(chunk.size)})`);
    });
    console.log('   Consider splitting these chunks further.');
  }
  
  const tooManySmallChunks = jsChunks.filter(chunk => chunk.size < 10000).length;
  if (tooManySmallChunks > 5) {
    console.log(`🟡 Many small chunks detected (${tooManySmallChunks} chunks <10KB)`);
    console.log('   Consider merging small chunks to reduce HTTP requests.');
  }
  
  if (totalJSSize > 2000000) {
    console.log('🔴 Total bundle size is large (>2MB)');
    console.log('   Consider lazy loading more components or removing unused dependencies.');
  } else if (totalJSSize > 1000000) {
    console.log('🟡 Total bundle size is moderate (>1MB)');
    console.log('   Monitor for further growth and consider optimizations.');
  } else {
    console.log('🟢 Bundle size looks good!');
  }
  
  // Top chunks analysis
  const topChunks = jsChunks.slice(0, 5);
  console.log('\n🏆 Largest Chunks:');
  console.log('━━━━━━━━━━━━━━━━━━');
  topChunks.forEach((chunk, index) => {
    const percentage = ((chunk.size / totalJSSize) * 100).toFixed(1);
    console.log(`${index + 1}. ${chunk.chunkName} - ${formatBytes(chunk.size)} (${percentage}%)`);
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 Run "npm run build:analyze" for detailed visual analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

analyzeBundle(); 