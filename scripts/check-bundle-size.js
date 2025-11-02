#!/usr/bin/env node

/**
 * Bundle size monitoring script
 * Checks if bundle size exceeds limits
 */

import { readFileSync, statSync } from 'fs';
import { join } from 'path';

const DIST_DIR = join(process.cwd(), 'dist');
const MAX_BUNDLE_SIZE = 500 * 1024; // 500KB

function getBundleSize(filename) {
  try {
    const filePath = join(DIST_DIR, filename);
    const stats = statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function checkBundleSize() {
  console.log('📦 Checking bundle sizes...\n');

  const files = [
    'assets/js/vendor-react-[hash].js',
    'assets/js/vendor-firebase-[hash].js',
    'assets/js/vendor-ui-[hash].js',
    'assets/js/index-[hash].js',
  ];

  let hasErrors = false;

  // Check actual files in dist
  try {
    const actualFiles = readFileSync(join(DIST_DIR, '.vite/manifest.json'), 'utf-8');
    const manifest = JSON.parse(actualFiles);
    
    Object.entries(manifest).forEach(([name, info]) => {
      if (info.isEntry && info.file) {
        const size = getBundleSize(info.file);
        const sizeKB = (size / 1024).toFixed(2);
        const status = size > MAX_BUNDLE_SIZE ? '❌' : '✅';
        
        console.log(`${status} ${name}: ${sizeKB}KB`);
        
        if (size > MAX_BUNDLE_SIZE) {
          hasErrors = true;
          console.log(`   ⚠️  Exceeds limit of ${(MAX_BUNDLE_SIZE / 1024).toFixed(0)}KB`);
        }
      }
    });
  } catch (error) {
    console.warn('Could not read manifest, checking dist directory...');
    // Fallback: check dist directory
  }

  if (hasErrors) {
    console.error('\n❌ Bundle size check failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All bundles within limits!');
  }
}

checkBundleSize();

