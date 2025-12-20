// PDF Worker
import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { Buffer } from 'buffer';
import PostPDF from '@components/pdf/PostPdf';
import CommentPDF from '@components/pdf/CommentPdf';

// Polyfill Buffer for the worker environment
if (typeof self !== 'undefined') {
  (self as any).global = self;
  (self as any).Buffer = Buffer;
}

// Prevent polyfill crashing
(self as any).__vite_plugin_react_preamble_installed__ = true;

self.onmessage = async (event) => {
  const { type, props } = event.data;

  try {
    const Component = type === 'post' ? PostPDF : CommentPDF;
    
    const blob = await pdf(
      React.createElement(Component as any, props)
    ).toBlob();

    self.postMessage({ status: 'success', blob });
  } catch (error: any) {
    self.postMessage({ status: 'error', error: error.message });
  }
};

