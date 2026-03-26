import type { CategoryKey, Endpoint } from './types';

const rawBaseUrl = import.meta.env.BASE_URL ?? '/';
const basePrefix = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

function withBase(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return basePrefix ? `${basePrefix}${normalized}` : normalized;
}

export const categoryLabels: Record<CategoryKey, string> = {
  artists: 'Artists',
  objects: 'Objects',
  exhibitions: 'Exhibitions',
  packages: 'Packages',
};

export const categories: CategoryKey[] = ['artists', 'objects', 'exhibitions', 'packages'];

export const categoryDescriptions: Record<CategoryKey, string> = {
  artists: 'Search and retrieve artist records with related collection context.',
  objects: 'Find artworks, fetch specific objects, and discover random works.',
  exhibitions: 'Explore exhibition records and exhibition list details.',
  packages: 'Browse and inspect curated package resources.',
};

export const endpoints: Endpoint[] = [
  {
    id: 'artists-search',
    method: 'GET',
    category: 'artists',
    title: 'Search Artists',
    description: 'Search artists with associated artworks and profile metadata.',
    pathTemplate: '/api/artists',
    docsPath: ['artists', 'search'],
    parameters: [
      { name: 'search', type: 'string', required: true, description: 'Artist query term.', example: 'picasso', location: 'query' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/artists?search=picasso&token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 1,
      artists: [{ artistID: 4609, displayName: 'Pablo Picasso', nationality: 'Spanish', objectCount: 1200 }],
    },
  },
  {
    id: 'artists-list',
    method: 'GET',
    category: 'artists',
    title: 'List Artists (Lightweight)',
    description: 'Lightweight artist listing for quick search and selection.',
    pathTemplate: '/api/artists-list',
    docsPath: ['artists', 'list'],
    parameters: [
      { name: 'search', type: 'string', required: false, description: 'Optional artist query term.', example: 'frida', location: 'query' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/artists-list?search=frida&token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 1,
      artists: [{ artistID: 1234, displayName: 'Frida Kahlo' }],
    },
  },
  {
    id: 'artists-by-id',
    method: 'GET',
    category: 'artists',
    title: 'Get Artist by ID',
    description: 'Retrieve a single artist by artist identifier.',
    pathTemplate: '/api/artists/{artist_id}',
    docsPath: ['artists', '[id]'],
    parameters: [
      { name: 'artist_id', type: 'integer', required: true, description: 'Artist identifier.', example: 4609, location: 'path' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/artists/4609?token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 1,
      artists: [{ artistID: 4609, displayName: 'Pablo Picasso', displayDate: 'Spanish, 1881–1973' }],
    },
  },
  {
    id: 'objects-search',
    method: 'GET',
    category: 'objects',
    title: 'Search Objects',
    description: 'Search objects across MoMA collection data.',
    pathTemplate: '/api/objects',
    docsPath: ['objects', 'search'],
    parameters: [
      { name: 'search', type: 'string', required: true, description: 'Search term for title, artist, etc.', example: 'starry', location: 'query' },
      { name: 'searchtype', type: 'string', required: false, description: 'Optional search type.', example: 'title', location: 'query' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/objects?search=starry&searchtype=title&token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 1,
      objects: [{ objectID: 2, title: 'The Starry Night', displayName: 'Vincent van Gogh', dated: '1889' }],
    },
  },
  {
    id: 'objects-by-id',
    method: 'GET',
    category: 'objects',
    title: 'Get Object by ID/Number',
    description: 'Get full metadata for one object by ID or accession number.',
    pathTemplate: '/api/objects/{object_id_number}',
    docsPath: ['objects', '[id]'],
    parameters: [
      { name: 'object_id_number', type: 'string', required: true, description: 'Object ID or accession number.', example: '79.1950', location: 'path' },
      { name: 'type', type: 'string', required: false, description: 'Optional identifier type.', example: 'accession', location: 'query' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/objects/79.1950?type=accession&token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 1,
      objects: [{
        objectNumber: '79.1950',
        objectID: 2,
        title: 'The Starry Night',
        displayName: 'Vincent van Gogh',
        artistID: 9,
        dated: '1889',
        dateBegin: 1889,
        dateEnd: 1889,
        medium: 'Oil on canvas',
        dimensions: '29 x 36 1/4" (73.7 x 92.1 cm)',
        department: 'Painting & Sculpture',
        classification: 'Painting',
        onView: 1,
        creditLine: 'Acquired through the Lillie P. Bliss Bequest',
        thumbnail: 'https://example.org/thumb.jpg',
        fullImage: 'https://example.org/full.jpg',
        currentLocation: 'Gallery 502',
        lastModifiedDate: '2026-03-25T18:17:27',
      }],
    },
  },
  {
    id: 'objects-random',
    method: 'GET',
    category: 'objects',
    title: 'Random Object',
    description: 'Retrieve one random artwork from the MoMA collection.',
    pathTemplate: '/api/objects/random',
    docsPath: ['objects', 'random'],
    parameters: [
      { name: 'onview', type: 'boolean', required: false, description: 'Filter for artworks currently on view.', example: true, location: 'query' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/objects/random?onview=1&token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 1,
      objects: [{ objectID: 3201, title: 'Random Artwork', onView: 1 }],
    },
  },
  {
    id: 'exhibitions-search',
    method: 'GET',
    category: 'exhibitions',
    title: 'Search Exhibitions',
    description: 'Search exhibitions with object and timeline metadata.',
    pathTemplate: '/api/exhibitions',
    docsPath: ['exhibitions', 'search'],
    parameters: [
      { name: 'search', type: 'string', required: true, description: 'Exhibition query term.', example: 'modern', location: 'query' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/exhibitions?search=modern&token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 1,
      exhibitions: [{ exhibitionID: 22, exhibitionTitle: 'Modern Masters', objectCount: 45 }],
    },
  },
  {
    id: 'exhibitions-list',
    method: 'GET',
    category: 'exhibitions',
    title: 'List Exhibitions',
    description: 'Lightweight exhibition list endpoint.',
    pathTemplate: '/api/exhibitions-list',
    docsPath: ['exhibitions', 'list'],
    parameters: [
      { name: 'search', type: 'string', required: false, description: 'Optional exhibition query term.', example: '2023', location: 'query' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/exhibitions-list?search=2023&token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 2,
      exhibitions: [{ exhibitionID: 88, exhibitionTitle: 'A 2023 Exhibition' }],
    },
  },
  {
    id: 'exhibitions-by-id',
    method: 'GET',
    category: 'exhibitions',
    title: 'Get Exhibition by ID',
    description: 'Retrieve one exhibition by identifier.',
    pathTemplate: '/api/exhibitions/{exhibition_id}',
    docsPath: ['exhibitions', '[id]'],
    parameters: [
      { name: 'exhibition_id', type: 'integer', required: true, description: 'Exhibition identifier.', example: 22, location: 'path' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/exhibitions/22?token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 1,
      exhibitions: [{ exhibitionID: 22, exhibitionTitle: 'Modern Masters' }],
    },
  },
  {
    id: 'exhibitions-list-by-id',
    method: 'GET',
    category: 'exhibitions',
    title: 'Get Exhibition-List Item by ID',
    description: 'Retrieve a single exhibition-list item by identifier.',
    pathTemplate: '/api/exhibitions-list/{exhibition_id}',
    docsPath: ['exhibitions', 'list', '[id]'],
    parameters: [
      { name: 'exhibition_id', type: 'integer', required: true, description: 'Exhibition identifier.', example: 22, location: 'path' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/exhibitions-list/22?token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 1,
      exhibitions: [{ exhibitionID: 22, exhibitionTitle: 'Modern Masters (List View)' }],
    },
  },
  {
    id: 'packages-list',
    method: 'GET',
    category: 'packages',
    title: 'List Packages',
    description: 'Search and list package resources.',
    pathTemplate: '/api/packages-list',
    docsPath: ['packages', 'list'],
    parameters: [
      { name: 'search', type: 'string', required: false, description: 'Optional package query term.', example: 'learning', location: 'query' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/packages-list?search=learning&token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 1,
      packages: [{ packageID: 4, packageTitle: 'Education Highlights' }],
    },
  },
  {
    id: 'packages-by-id',
    method: 'GET',
    category: 'packages',
    title: 'Get Package by ID',
    description: 'Retrieve package details by package identifier.',
    pathTemplate: '/api/packages/{package_id}',
    docsPath: ['packages', '[id]'],
    parameters: [
      { name: 'package_id', type: 'integer', required: true, description: 'Package identifier.', example: 4, location: 'path' },
      { name: 'token', type: 'string', required: true, description: 'MoMA API token.', example: 'YOUR_TOKEN', location: 'query' },
    ],
    exampleRequest: 'GET /api/packages/4?token=YOUR_TOKEN',
    exampleResponse: {
      source: 'MoMA TMS API',
      language: 'en',
      resultsCount: 1,
      packages: [{ packageID: 4, packageTitle: 'Education Highlights' }],
    },
  },
];

const byId = new Map(endpoints.map((endpoint) => [endpoint.id, endpoint]));

export function getEndpointById(id: string): Endpoint | undefined {
  return byId.get(id);
}

export function getEndpointsByCategory(category: CategoryKey): Endpoint[] {
  return endpoints.filter((endpoint) => endpoint.category === category);
}

export function endpointHref(endpoint: Endpoint): string {
  return withBase(`/docs/${endpoint.docsPath.join('/')}`);
}

export function categoryHref(category: CategoryKey): string {
  return withBase(`/docs/${category}`);
}

export function homeHref(): string {
  return withBase('/');
}

export function docsRootHref(): string {
  return withBase('/docs');
}

export function routeToEndpoint(slugParts: string[]): Endpoint | undefined {
  return endpoints.find((endpoint) => {
    if (endpoint.docsPath.length !== slugParts.length) return false;
    return endpoint.docsPath.every((segment, index) => {
      if (segment === '[id]') return slugParts[index] === '[id]';
      return segment === slugParts[index];
    });
  });
}
