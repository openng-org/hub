import { MCPFeature } from './mcp.model';

export type { MCPFeature } from './mcp.model';

export const mcpFeatures: MCPFeature[] = [
  {
    id: 'ai-tutor',
    name: 'ai_tutor',
    description: `Acts as a RAG (Retrieval-Augmented Generation) source, effectively
reprogramming the assistant to become a specialized Angular tutor by providing it
with a new core identity and knowledge base.`,
    type: 'tool',
    versions: [
      {
        version: 21,
        status: 'stable',
      },
      {
        version: 22,
        status: 'stable',
      },
    ],
  },
  {
    id: 'best-practices',
    name: 'get_best_practices',
    description: `Retrieves the official Angular Best Practices Guide.`,
    type: 'tool',
    versions: [
      {
        version: 20.2,
        status: 'stable',
      },
      {
        version: 21,
        status: 'stable',
      },
      {
        version: 22,
        status: 'stable',
      },
    ],
  },
  {
    id: 'doc-search',
    name: 'search_documentation',
    description: `concise and specific search query for the Angular documentation.`,
    type: 'tool',
    versions: [
      {
        version: 20.2,
        status: 'stable',
      },
      {
        version: 21,
        status: 'stable',
      },
      {
        version: 22,
        status: 'stable',
      },
    ],
  },
  {
    id: 'find-example',
    name: 'find_examples',
    description: `Provides Angular code examples to improve the generated code quality output.`,
    type: 'tool',
    versions: [
      {
        version: 20.2,
        status: 'experimental',
      },
      {
        version: 21,
        status: 'stable',
      },
      {
        version: 22,
        status: 'stable',
      },
    ],
  },
  {
    id: 'list-projects',
    name: 'list_projects',
    description: `Provides a comprehensive overview of all Angular workspaces and projects within the repository.`,
    type: 'tool',
    versions: [
      {
        version: 20.1,
        status: 'stable',
      },
      {
        version: 21,
        status: 'stable',
      },
      {
        version: 22,
        status: 'stable',
      },
    ],
  },
  {
    id: 'modernize',
    name: 'modernize',
    description: `Provides instructions and commands for modernizing Angular code to align with the latest best
practices and syntax.`,
    type: 'tool',
    versions: [
      {
        version: 20.2,
        status: 'experimental',
      },
      {
        version: 21,
        status: 'experimental',
      },
      {
        version: 22,
        status: 'experimental',
      },
    ],
  },
  {
    id: 'zoneless-migration',
    name: 'onpush-zoneless-migration',
    description: `Analyzes Angular code and provides a step-by-step, iterative plan to migrate it to OnPush
change detection, a prerequisite for a zoneless application.`,
    type: 'tool',
    versions: [
      {
        version: 20.3,
        status: 'experimental',
      },
      {
        version: 21.1,
        status: 'stable',
      },
      {
        version: 22,
        status: 'stable',
      },
    ],
  },
  {
    id: 'instructions',
    name: 'instructions',
    description: `Comprehensive guide detailing Angular's best practices for code generation and development.`,
    type: 'resource',
    versions: [
      {
        version: 20.1,
        status: 'stable',
      },
      {
        version: 21,
        status: 'stable',
      },
      {
        version: 22,
        status: 'stable',
      },
    ],
  },
  {
    id: 'test-tool',
    name: 'test',
    description: `Perform a one-off, non-watched unit test execution with ng test.`,
    type: 'tool',
    versions: [
      {
        version: 21.1,
        status: 'experimental',
      },
      {
        version: 22,
        status: 'experimental',
      },
    ],
  },
  {
    id: 'e2e-tool',
    name: 'e2e',
    description: `Perform an end-to-end test with ng e2e.`,
    type: 'tool',
    versions: [
      {
        version: 21.1,
        status: 'experimental',
      },
      {
        version: 22,
        status: 'experimental',
      },
    ],
  },
  {
    id: 'build-tool',
    name: 'build',
    description: `Perform a one-off, non-watched build using "ng build".`,
    type: 'tool',
    versions: [
      {
        version: 21.1,
        status: 'experimental',
      },
      {
        version: 22,
        status: 'experimental',
      },
    ],
  },
  {
    id: 'start-devserver-tool',
    name: 'devserver.start',
    description: `Starts the Angular development server ("ng serve") as a background process.`,
    type: 'tool',
    versions: [
      {
        version: 21.1,
        status: 'experimental',
      },
      {
        version: 22,
        status: 'experimental',
      },
      {
        version: 22.1,
        status: 'stable',
      },
    ],
  },
  {
    id: 'stop-devserver-tool',
    name: 'devserver.stop',
    description: `Stops a running Angular development server ("ng serve") that was started with the "start_devserver" tool.`,
    type: 'tool',
    versions: [
      {
        version: 21.1,
        status: 'experimental',
      },
      {
        version: 22,
        status: 'experimental',
      },
      {
        version: 22.1,
        status: 'stable',
      },
    ],
  },
  {
    id: 'wait-for-devserver-build-tool',
    name: 'devserver.wait_for_build',
    description: `Waits for a dev server that was started with the "start_devserver" tool to complete its build.`,
    type: 'tool',
    versions: [
      {
        version: 21.1,
        status: 'experimental',
      },
      {
        version: 22,
        status: 'experimental',
      },
      {
        version: 22.1,
        status: 'stable',
      },
    ],
  },
];
