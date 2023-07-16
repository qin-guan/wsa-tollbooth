import { generateOpenApiDocument } from 'trpc-openapi'

import { appRouter } from './trpc/routers'

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Example CRUD API',
  description: 'OpenAPI compliant REST API built using tRPC with Next.js',
  version: '1.0.0',
  baseUrl: 'https://wsa.qinguan.me/api',
  docsUrl: 'https://github.com/jlalmes/trpc-openapi',
  tags: ['auth', 'users', 'posts'],
})
