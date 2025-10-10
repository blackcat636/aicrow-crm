import type { NextConfig } from "next";
import css from "styled-jsx/css";

const nextConfig: NextConfig = {
  /* config options here */
  name: 'aicrow-crm',
  title: 'AICrow CRM',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:;"
          }
        ]
      }
    ];
  },
  head: {
    title: {
      template: '%s | AICrow CRM',
      default: 'AICrow CRM',
    },
    css: [
      {}
    ],
  }
};

export default nextConfig;
