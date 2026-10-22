using { TravelService } from './travel-service';
using { AnalyticsService } from './analytics-service';

// Serve both services over OData (for the Fiori apps) and MCP (for agents).
// Each protocol needs its own path: with the services' absolute @path, both
// would otherwise mount on /processor and /analytics and OData would shadow MCP.
annotate TravelService with @protocol: [
  { kind: 'odata', path: '/processor' },
  { kind: 'mcp', path: '/mcp/processor' }
];
annotate AnalyticsService with @protocol: [
  { kind: 'odata', path: '/analytics' },
  { kind: 'mcp', path: '/mcp/analytics' }
];
